#!/usr/bin/env python3
import argparse
import contextlib
import copy
import json
import os
import re
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterator
HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = Path("/mnt/Cursor/PuppetMaster")
import dependency_bootstrap as DB
DEPENDENCY_RECEIPT = DB.materialize()
V7 = DB.verified_root()
PROMPT = HERE / "prompt.txt"
CANARY_AUTHORITY = R10 / "STORAGE_MIMO_NORMALIZED_CANARY_V3_AUTHORITY.json"
CANARY_PUSH_CUSTODY = R10 / "STORAGE_MIMO_NORMALIZED_CANARY_V3_PUSH_CUSTODY.json"
CANARY_SOURCE_COMMIT = "fccf63c813e185c715293005f7f7390d28a850ae"
CANARY_EVIDENCE_COMMIT = "7c017517c48ce678eea580a1639ef16d7d6bd408"
CANARY_CLOSURE_COMMIT = "bd2da304e75d4a551f80f5ddba969f4531f7a385"
for _path in (V7,):
    sys.path.insert(0, str(_path))
import local_runtime as LR
P,V,base,omp_session,freeze_check=LR.P,LR.V,LR.base,LR.omp_session,LR.freeze_check
N=LR
CONTRACT = HERE / "matrix_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "matrix_contract.json", "controller.py", "dependency_bootstrap.py", "local_runtime.py", "local_runtime_selftest.py", "prompt.txt", "selftest.py", "replay.py", "dev13_replay.py", "dev14_replay.py", "dev_selftest.py", "one_turn_selftest.py", "shutdown_artifact_selftest.py", "controls_selftest.py", "development_lineage.json")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
GLM_ROUTE = "omp_glm53_flash_max"
ENV_FIELDS = ("home_dir","xdg_config_home","xdg_cache_home","xdg_data_home","claude_config_dir","copilot_home")
OMP_PATH_STEMS = {
    "cwd": "cwd", "session_dir": "session", "profile_dir": "profile", "home_dir": "home",
    "xdg_config_home": "xdg-config", "xdg_cache_home": "xdg-cache", "xdg_data_home": "xdg-data",
    "claude_config_dir": "claude-config", "copilot_home": "copilot-home", "snapshot_dir": "snapshot",
}
PRIVATE_CAPTURE_STEM = "http"
CURRENT_ROW: dict[str, Any] | None = None
DISPATCH_CUSTODY: dict[str, Any] | None = None
class PromptDirectory:
    def __truediv__(self, name: str) -> Path:
        return PROMPT if name == "omp.prompt.txt" else V7 / "prompts" / name
class RuntimeRoot(os.PathLike[str]):
    def __fspath__(self) -> str: return str(V7)
    def __str__(self) -> str: return str(V7)
    def __truediv__(self, name: str) -> Any:
        if name == "prompts": return PromptDirectory()
        if name == "prompts/omp.prompt.txt": return PROMPT
        return V7 / name
RUNTIME_ROOT = RuntimeRoot()
class MatrixError(RuntimeError): pass
class PermanentMatrixError(RuntimeError): pass
def require(value: bool, message: str) -> None:
    if not value:
        raise MatrixError(message)
def permanent(value: bool, message: str) -> None:
    if not value:
        raise PermanentMatrixError(message)
def spec() -> dict[str, Any]:
    value = P.load_json(CONTRACT)
    require(isinstance(value, dict), "contract object")
    return value
def rows() -> list[dict[str, Any]]:
    value = spec().get("rows")
    require(isinstance(value, list) and len(value) == 1, "one frozen diagnostic row")
    return value
def route_map() -> dict[str, dict[str, Any]]:
    routes = spec().get("routes")
    require(isinstance(routes, list) and len(routes) == 1, "one frozen diagnostic route")
    return {route["id"]: route for route in routes}
def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["pass_id"], row["route_id"]): row for row in rows()}
def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    matches = [row for row in rows() if row["pass_id"] == pass_id and row["route_id"] == route_id]
    require(len(matches) == 1, "one planned row")
    return matches[0]
def selected_row() -> dict[str, Any]:
    require(CURRENT_ROW is not None, "selected row")
    return CURRENT_ROW
def row_dir(row: dict[str, Any] | None = None) -> Path:
    item = row or selected_row()
    return EVIDENCE / item["pass_id"] / item["route_id"]
def file_record(path: Path, root: Path = REPO) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file: {path}")
    if root==REPO and (path==HERE or HERE in path.parents): root=HERE
    return {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}
def expected_records(field: str, root: Path = REPO) -> list[dict[str, Any]]:
    result = []
    for expected in spec()[field]:
        path = root / expected["path"]
        actual = file_record(path, root)
        require(actual == expected, f"{field} drift: {expected['path']}")
        result.append(actual)
    return result
def run_git(*args: str, binary: bool = False) -> subprocess.CompletedProcess[Any]:
    return subprocess.run(["git", "-C", str(REPO), *args], check=False, capture_output=True, text=not binary)
def pinned_record(commit: str, relative: str) -> tuple[dict[str, Any], bytes]:
    listing = run_git("ls-tree", commit, "--", relative)
    lines = listing.stdout.splitlines()
    require(listing.returncode == 0 and len(lines) == 1, f"one pinned Git entry: {commit}:{relative}")
    metadata, seen = lines[0].split("\t", 1)
    mode, kind, oid = metadata.split()
    require(seen == relative and kind == "blob" and mode in {"100644", "100755"}, f"pinned blob: {relative}")
    blob = run_git("cat-file", "blob", oid, binary=True)
    require(blob.returncode == 0, f"read pinned blob: {relative}")
    raw = blob.stdout
    return {"path": relative, "bytes": len(raw), "sha256": P.sha256_bytes(raw), "mode": mode, "blob": oid}, raw
def pinned_json(commit: str, relative: str) -> tuple[dict[str, Any], dict[str, Any]]:
    record, raw = pinned_record(commit, relative)
    value = P.strict_loads(raw.decode())
    require(isinstance(value, dict), f"pinned JSON object: {relative}")
    return record, value
def commit_shape(commit: str) -> tuple[list[str], str]:
    kind = run_git("cat-file", "-t", commit)
    parents = run_git("show", "-s", "--format=%P", commit)
    tree = run_git("rev-parse", f"{commit}^{{tree}}")
    require(kind.returncode == parents.returncode == tree.returncode == 0 and kind.stdout.strip() == "commit", f"pinned commit: {commit}")
    return parents.stdout.strip().split(), tree.stdout.strip()
def pinned_diff(base_commit: str, tip_commit: str) -> list[dict[str, Any]]:
    result = run_git("diff-tree", "--raw", "-r", "--no-commit-id", base_commit, tip_commit, "--")
    require(result.returncode == 0, "pinned diff-tree")
    records = []
    for line in result.stdout.splitlines():
        metadata, path = line.split("\t", 1)
        old_mode, new_mode, _old_oid, new_oid, status = metadata[1:].split()
        require(status in {"A", "M"} and new_mode in {"100644", "100755"}, f"closed pinned delta: {path}")
        record, _raw = pinned_record(tip_commit, path)
        require((record["mode"], record["blob"]) == (new_mode, new_oid), f"diff/blob join: {path}")
        records.append({**record, "status": status})
    return sorted(records, key=lambda item: item["path"].encode())
def git_entry(relative: str, *, index: bool) -> tuple[str, str]:
    result = run_git(*( ("ls-files", "--stage", "--", relative) if index else ("ls-tree", "HEAD", "--", relative) ))
    lines = result.stdout.splitlines()
    require(result.returncode == 0 and len(lines) == 1, f"one Git entry: {relative}")
    metadata, seen = lines[0].split("\t", 1)
    fields = metadata.split()
    require(seen == relative and len(fields) == 3, f"Git entry shape: {relative}")
    if index:
        require(fields[2] == "0", f"stage zero: {relative}")
        return fields[0], fields[1]
    require(fields[1] == "blob", f"HEAD blob: {relative}")
    return fields[0], fields[2]
def git_file(relative: str) -> dict[str, Any]:
    path = REPO / relative
    current = REPO
    for part in Path(relative).parts[:-1]:
        current /= part
        require(current.is_dir() and not current.is_symlink(), f"nonsymlink parent: {relative}")
    mode = path.lstat().st_mode
    require(stat.S_ISREG(mode) and not path.is_symlink(), f"regular Git file: {relative}")
    index, head = git_entry(relative, index=True), git_entry(relative, index=False)
    require(index == head and head[0] in {"100644", "100755"}, f"index/HEAD join: {relative}")
    blob = run_git("cat-file", "blob", head[1], binary=True)
    require(blob.returncode == 0 and blob.stdout == path.read_bytes(), f"live/HEAD bytes: {relative}")
    require(bool(mode & 0o111) == (head[0] == "100755"), f"live/HEAD mode: {relative}")
    record = file_record(path)
    record.update(git_mode=head[0], git_oid=head[1])
    return record
def git_custody() -> dict[str, Any]:
    refs = [run_git("rev-parse", ref) for ref in ("HEAD", "origin/main", "truenas-backup/main")]
    values = [result.stdout.strip() for result in refs]
    require(all(result.returncode == 0 for result in refs) and all(len(value) == 40 for value in values), "Git refs")
    require(values[0] == values[1] == values[2], "dual-pushed candidate")
    owned = [git_file((HERE / name).relative_to(REPO).as_posix()) for name in SOURCES]
    snapshot=DB.verify(); dependencies=[{"path":f"{DB.PREFIX}/{item['path']}","bytes":item["bytes"],"sha256":item["sha256"],"git_mode":item["mode"],"git_oid":item["blob"]} for item in snapshot["files"]]
    require([{key:item[key] for key in ("path","bytes","sha256")} for item in dependencies]==spec()["dependencies"],"bootstrapped dependency custody")
    return {"candidate_commit": values[0], "head": values[0], "origin_main": values[1], "truenas_backup_main": values[2], "sources": owned, "dependencies": dependencies}
G=LR.LocalRuntime(repo=REPO,here=HERE,v7=V7,prompt=PROMPT,evidence=EVIDENCE,spec=spec,rows=rows,row_dir=row_dir,git_custody=git_custody,normalizer=LR.normalize_verified_session,error_type=MatrixError,permanent_error_type=PermanentMatrixError,cleanup_prefix="/tmp/pm-r10-storage-v7-snapshot-fallback-v14-",route_id=GLM_ROUTE,visible_selection="GLM-5.3-Flash (2x usage) · ◉ max ·".encode())
if os.environ.get("PM_R10_V14_TEST_POPEN_SENTINEL"):
    require(os.environ.get("PM_R10_V14_TEST_POPEN_SENTINEL")=="EXACT_AFTER_REAL_PREFLIGHT_V1","exact test-only Popen sentinel authority")
    _sentinel_path=Path(os.environ.get("PM_R10_V14_TEST_POPEN_SENTINEL_RECEIPT","")); require(_sentinel_path.parent==Path("/tmp/pm-r10-storage-v14-integration") and _sentinel_path.name in {"normal-sentinel.json","optimized-sentinel.json"} and not os.path.lexists(_sentinel_path),"fresh scoped test-only sentinel receipt")
    _sentinel_count=0
    def _test_only_popen_sentinel(argv:Any,*_args:Any,**_kwargs:Any)->Any:
        global _sentinel_count
        _sentinel_count+=1; require(_sentinel_count==1,"test-only subject Popen exactly once")
        receipt={"schema_id":"pm.r10.storage_pipeline.v14_test_only_popen_sentinel.v1","classification":"TEST_ONLY_NO_PROVIDER_PROCESS","count":_sentinel_count,"argv":argv,"profile_dir":selected_row()["profile_dir"],"preflight":file_record(row_dir()/"omp_preflight.json",row_dir())}; P.atomic_write(_sentinel_path,P.pretty_json(receipt))
        raise PermanentMatrixError("V14_TEST_ONLY_SUBJECT_POPEN_SENTINEL count=1")
    G.ORIGINAL_POPEN=_test_only_popen_sentinel
def runtime_paths(row: dict[str, Any]) -> list[str]:
    fields = ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS)
    return [row[field] for field in (*fields, "private_capture_dir") if row.get(field)]
def validate_omp_paths(row: dict[str, Any]) -> dict[str, str]:
    require(row.get("surface") == "omp_tui" and re.fullmatch(r"[0-9a-f]{32}", str(row.get("nonce"))) is not None, "OMP path identity")
    nonce = row["nonce"]
    expected = {field: (f"/tmp/pm-r10-storage-v7-fallback-v14-cwd-{nonce}" if field == "cwd" else f"/tmp/pm-r10-storage-v7-{stem}-fallback-v14-{nonce}") for field, stem in OMP_PATH_STEMS.items()}
    require(all(row.get(field) == value for field, value in expected.items()), "exact fallback V14 OMP paths")
    if row.get("model") == "opencode-go/glm-5.3-flash":
        private = f"/tmp/pm-r10-storage-v7-{PRIVATE_CAPTURE_STEM}-fallback-v14-{nonce}"
        require(row.get("private_capture_dir") == private, "exact nonce-bound private GLM capture path")
        expected["private_capture_dir"] = private
    else:
        require("private_capture_dir" not in row, "MiMo row has no private HTTP capture path")
    require(row["cwd"].startswith("/tmp/pm-r10-storage-v7-") and row["session_dir"].startswith("/tmp/pm-r10-storage-v7-session-"), "imported runner cwd/session prefixes")
    require(runtime_paths(row) == [row[field] for field in ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS, "private_capture_dir") if field in expected], "exact runtime path roster")
    return expected
def historical_identity_clean(frozen: list[dict[str, Any]]) -> None:
    needles = []
    for row in frozen:
        needles.extend(str(row[field]).encode() for field in ("attempt_id", "nonce", "cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS, "private_capture_dir", "projectless_directory_name", "title") if row.get(field))
    require(len(needles) == len(set(needles)), "globally unique planned identities")
    working_v7=REPO/Path(G.snapshot["source_manifest"]["path"]).parent
    for path in R10.rglob("*.json"):
        if HERE in path.parents or path==working_v7 or working_v7 in path.parents:
            continue
        raw = path.read_bytes()
        require(not any(needle in raw for needle in needles), f"historical identity reuse: {path}")
def metric(path: Path) -> dict[str, int]:
    return {"lines": len(path.read_bytes().splitlines()), "bytes": path.stat().st_size}
def verify_pinned_canary() -> dict[str, Any]:
    frozen = spec()["detached_v3_custody"]
    require(frozen["source_commit"] == CANARY_SOURCE_COMMIT and frozen["evidence_commit"] == CANARY_EVIDENCE_COMMIT and frozen["closure_commit"] == CANARY_CLOSURE_COMMIT, "three pinned V3 commits")
    source_parents, source_tree = commit_shape(CANARY_SOURCE_COMMIT)
    evidence_parents, evidence_tree = commit_shape(CANARY_EVIDENCE_COMMIT)
    closure_parents, closure_tree = commit_shape(CANARY_CLOSURE_COMMIT)
    require(source_parents and evidence_parents == [CANARY_SOURCE_COMMIT] and closure_parents == [CANARY_EVIDENCE_COMMIT], "V3 ancestry")
    require(run_git("merge-base", "--is-ancestor", CANARY_CLOSURE_COMMIT, "HEAD").returncode == 0, "V3 closure ancestor")
    authority_path, custody_path = (path.relative_to(REPO).as_posix() for path in (CANARY_AUTHORITY, CANARY_PUSH_CUSTODY))
    authority_record, authority = pinned_json(CANARY_EVIDENCE_COMMIT, authority_path)
    custody_record, custody = pinned_json(CANARY_CLOSURE_COMMIT, custody_path)
    require({key: authority_record[key] for key in frozen["authority"]} == frozen["authority"] and {key: custody_record[key] for key in frozen["push_custody"]} == frozen["push_custody"], "V3 pinned receipt records")
    require(custody["detached_anchors"]["source_commit"] == CANARY_SOURCE_COMMIT and custody["detached_anchors"]["evidence_commit"] == CANARY_EVIDENCE_COMMIT, "V3 detached anchors")
    require(custody["authorization"]["authorizes_matrix"] is False and custody["authorization"]["matrix_credit"] == 0, "V3 does not self-authorize matrix")
    terminal_record = authority["primary_records"]["terminal"]
    actual, terminal = pinned_json(CANARY_EVIDENCE_COMMIT, terminal_record["path"])
    require({key: actual[key] for key in ("path", "bytes", "sha256")} == terminal_record and terminal["status"] == "PASS" and terminal["model"] == "opencode-zen/mimo-v2.5-free" and terminal["thinking"] == "high", "V3 terminal PASS")
    require(terminal["goal_activation_observed"] is terminal["goal_complete_observed"] is True and terminal["process_exit_code"] == 0 and terminal["no_retry"] is True and terminal["qualification_credit"] == 0, "V3 lifecycle/zero-credit")
    formal = terminal["formal_chain"]; require(formal["schema_id"] == "pm.r10.storage_pipeline.mimo_normalized_formal_chain.v3" and formal == custody["evidence_custody"]["terminal_formal_chain"], "V3 formal chain")
    for record in formal["records"].values():
        full = terminal_record["path"].rsplit("/", 1)[0] + "/" + record["path"]
        pinned, _raw = pinned_record(CANARY_EVIDENCE_COMMIT, full)
        require((pinned["bytes"], pinned["sha256"]) == (record["bytes"], record["sha256"]), "V3 formal evidence pin")
    require(source_tree == frozen["source_tree"] and evidence_tree == frozen["evidence_tree"] and closure_tree == frozen["closure_tree"], "V3 pinned trees")
    return {"status":"PASS_PINNED_V3_CANARY_CUSTODY", "source_commit":CANARY_SOURCE_COMMIT, "evidence_commit":CANARY_EVIDENCE_COMMIT, "closure_commit":CANARY_CLOSURE_COMMIT, "matrix_authorization_claim":False, "subject_calls":0}
def verify_v4_failure_lineage() -> dict[str, Any]:
    return {"status":"PRIOR_FAILURES_REMAIN_FAILURES", "qualification_credit":0, "subject_calls":0}
def verify_v8_prelaunch_failure_lineage() -> dict[str,Any]:
    frozen=spec()["v8_prelaunch_failure_lineage"]; expected={"commit":"4c2b94e5d873a8eed4c813f4db7a2168d07cbe05","path":"tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/storage_mimo_goal_completion_diagnostic_v8/prelaunch_failure_review.json","mode":"100644","blob":"a7c838cf04ef886da08d8b3e945d7859937db002","bytes":7751,"sha256":"59ceded8ed8304b3d9712071fa1ccdf7ce055dcafc91332d0a30932b52101d3f"}; require(frozen==expected,"exact V8 review lineage contract")
    record,raw=pinned_record(frozen["commit"],frozen["path"]); require(record=={key:frozen[key] for key in ("path","bytes","sha256","mode","blob")},"exact V8 review Git blob")
    try: review=P.strict_loads(raw.decode("utf-8"))
    except Exception as exc: raise MatrixError(f"V8 review strict JSON: {exc}") from exc
    require(isinstance(review,dict) and review.get("schema_id")=="pm.r10.storage_pipeline.mimo_goal_completion_diagnostic_v8.prelaunch_failure_review.v1","V8 review schema")
    outcome=review.get("executor_observation",{}); disposition=review.get("disposition",{}); absence=review.get("absence_custody",{}); phase=review.get("phase_and_cause",{})
    require(outcome.get("status")=="FAIL_PRELAUNCH_NO_MUTATION" and outcome.get("qualification_credit")==0 and disposition.get("attempt_consumed") is False and disposition.get("qualification_credit")==0 and disposition.get("no_retry") is True and disposition.get("retro_credit_authorized") is False and disposition.get("retro_credit_forbidden") is True and disposition.get("suffix_blocked") is True and disposition.get("suffix_launch_authorized") is False,"V8 failure remains unconsumed zero-credit no-retry/no-retro suffix-blocked")
    require(absence.get("all_paths_absent") is True and all(absence.get(key) is True for key in ("reservation_absent","evidence_absent","pid_absent","session_absent","goal_absent","catalog_receipt_absent","provider_call_absent","prompt_submission_absent","subject_popen_absent")) and all(phase.get(key) is True for key in ("before_omp_runtime_and_config_preflight","before_forced_catalog_refresh","before_input_snapshot_materialization","before_reservation","before_subject_popen","before_provider_call","before_prompt_write")),"V8 absence/zero-call facts")
    return {"status":"PASS_PINNED_V8_PRELAUNCH_FAILURE_LINEAGE","attempt_consumed":False,"qualification_credit":0,"subject_calls":0}
def verified_authority() -> dict[str, Any]:
    authority, frozen = spec()["authority"], rows()
    require(authority["schema_id"]=="pm.r10.storage_pipeline.active_user_fallback_authority.v1" and authority["authority_source"]=="active_user_direction_2026-08-28_v14", "current diagnostic authority")
    require(authority["authorized_attempt_ids"]==[frozen[0]["attempt_id"]] and authority["authorized_row_count"]==authority["authorized_call_count"]==1 and (authority["authorized_route"],authority["authorized_model"],authority["authorized_thinking"])==(frozen[0]["route_id"],frozen[0]["model"],frozen[0]["thinking"]), "one exact authorized diagnostic")
    require(authority["runtime_launch_authorized"] is authority["provider_calls_authorized"] is authority["exact_ordinal_prefix_fail_stop_required"] is True and authority["codex_app_creation_authorized"] is False and authority["qualification_credit"]==0, "diagnostic runtime authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized","live_plans_or_ledgers_authorized","windows_interaction_authorized","worknodes_authorized")), "authority ceiling")
    verify_pinned_canary()
    return authority
def verify_development_lineage() -> dict[str, Any]:
    require(file_record(HERE/"development_lineage.json",HERE)==spec()["development_lineage_custody"],"development lineage file custody")
    value=P.load_json(HERE/"development_lineage.json")
    require(value.get("schema_id")=="pm.r10.storage_pipeline.glm53_max_fallback_development_lineage.v1" and value.get("qualification_authority") is False and value.get("qualification_credit")==0 and value.get("launch_authority_conferred") is False and value.get("nonqualification_lineage_only") is True,"development lineage ceiling")
    reason=value.get("mimo_fallback_reason",{}); require(reason.get("attempt_id")=="storage-mimo-dev-dev11-e34fff7f6b" and reason.get("provider_error_status")==429 and reason.get("provider_error_type")=="FreeUsageLimitError" and reason.get("status")=="FAIL_CONSUMED_ZERO_CREDIT" and reason.get("no_retry") is True,"MiMo 429 fallback reason")
    passes=value.get("development_passes"); require(isinstance(passes,list) and len(passes)==2 and value.get("consecutive_core_passes") is True,"two development passes")
    expected=[("dev17","storage-mimo-dev-dev17-304e207283","01a046fc-5769-74e0-97b5-2640df1d1473","15690c6a6e9351c8","ed846c44627593316f6b828c2c6b52c3c806606d4080fa803b20015bb55554bb"),("dev18","storage-mimo-dev-dev18-17abe9b304","01a046ff-1bff-735e-ad8f-68dd93c637d6","15690d1b980a363b","72fa9a7a3b950aa0b78bfbe82b6c64b031832a497d6c1a950f28563cec9d9ba9")]
    require(all((item.get("label"),item.get("attempt_id"),item.get("session_id"),item.get("goal_id"),item.get("session",{}).get("sha256"))==frozen and item.get("model")=="opencode-go/glm-5.3-flash" and item.get("thinking")=="max" and item.get("status")=="PASS_DEVELOPMENT_ZERO_CREDIT" and item.get("qualification_credit")==0 for item,frozen in zip(passes,expected,strict=True)),"exact zero-credit GLM development receipts")
    return {"status":"PASS_NONQUALIFICATION_DEVELOPMENT_LINEAGE","qualification_credit":0,"subject_calls":0}
def verify_v10_hold_lineage()->dict[str,Any]:
    frozen=spec()["v10_hold_lineage"]; v10_path=(R10/"storage_glm53_max_fallback_qualification_v10").relative_to(REPO).as_posix(); require(run_git("rev-parse",f"{frozen['source_commit']}^{{tree}}").stdout.strip()==frozen["source_tree_oid"] and run_git("rev-parse",f"{frozen['source_commit']}:{v10_path}").stdout.strip()==frozen["package_source_tree_oid"] and run_git("merge-base","--is-ancestor",frozen["source_commit"],"HEAD").returncode==0,"V10 source commit/tree lineage")
    for name in ("review","hold","terminal","preflight","journal"):
        expected=frozen[name]; path=R10/expected["path"]; require(file_record(path,R10)==expected,f"V10 {name} custody")
    review=P.load_json(R10/frozen["review"]["path"]); wrapper=review["wrapper_hold"]; cause=wrapper["cause"]; terminal=review["immutable_subject_terminal"]
    require(review["review_status"]==frozen["status"]=="HOLD_POST_PASS_CONTROLLER_FAULT" and review["qualification_pass"] is False and review["qualification_credit"]==frozen["qualification_credit"]==0,"V10 HOLD/zero-credit lineage"); require(wrapper["no_retry"] is frozen["no_retry"] is True and wrapper["no_retro_credit"] is frozen["no_retro_credit"] is True and wrapper["suffix_blocked"] is wrapper["pass_terminal_immutable"] is True,"V10 no-retry/no-retro lineage")
    require(cause["classification"]=="self_imposed_preflight_to_launch_freshness_window_exceeded" and cause["observed_delta_seconds"]==frozen["observed_delta_seconds"]==86.771 and cause["required_maximum_delta_seconds"]==frozen["obsolete_max_seconds"]==60 and cause["provider_or_model_failure"] is False,"V10 exact obsolete 60-second HOLD cause"); require(terminal["status"]=="PASS" and terminal["process_exit_code"]==0 and terminal["goal_complete_observed"] is True and terminal["terminal_subject_pass_does_not_equal_qualification_pass"] is True,"V10 immutable subject PASS is not qualification")
    return {"status":"PASS_V10_HOLD_ZERO_CREDIT_LINEAGE","qualification_credit":0,"no_retry":True,"subject_calls":0}
def verify_pre_popen_failure_lineage(version:int)->dict[str,Any]:
    label=f"V{version}"; frozen=spec()[f"v{version}_pre_popen_failure_lineage"]; root=R10/f"storage_glm53_max_fallback_qualification_v{version}"/"evidence"/"qualification_01"/"omp_glm53_flash_max"
    require(run_git("merge-base","--is-ancestor",frozen["source_commit"],"HEAD").returncode==0,f"{label} source commit lineage")
    require(set(frozen)=={"source_commit","attempt_id","nonce","error","status","qualification_credit","no_retry","popen_observed","evidence"} and frozen["status"]=="FAIL_PRE_POPEN_CONSUMED_ZERO_CREDIT" and frozen["qualification_credit"]==0 and frozen["no_retry"] is True and frozen["popen_observed"] is False,f"{label} frozen failure disposition")
    require(set(frozen["evidence"])=={"omp_preflight.json","reservation.json","runner_failure.json","stdin_enter.raw","stdin_prompt.raw","terminal.json","transcript.raw"},f"{label} exact failure evidence roster")
    for name,expected in frozen["evidence"].items(): require(file_record(root/name,root)=={"path":name,**expected},f"{label} {name} custody")
    reservation=P.load_json(root/"reservation.json"); failure=P.load_json(root/"runner_failure.json"); terminal=P.load_json(root/"terminal.json")
    require(all(value.get("attempt_id")==frozen["attempt_id"] and value.get("nonce")==frozen["nonce"] and value.get("qualification_credit")==0 for value in (reservation,failure,terminal)),f"{label} failure identity/credit")
    require(reservation["retry_count"]==0 and failure["error"]==frozen["error"] and failure["no_retry"] is True and failure["popen_observed"] is False and failure["pid"] is None,f"{label} exact pre-Popen failure")
    require(terminal["status"]=="FAIL" and terminal["failure_code"]=="RUNNER_OR_EVIDENCE_FAILURE" and terminal["no_retry"] is True and terminal["process_exit_code"] is None and terminal["goal_activation_observed"] is terminal["goal_complete_observed"] is False and terminal["final_assistant_text"]=="" and terminal["observed_identity"] is terminal["observed_non_goal_tool_calls"] is None,f"{label} terminal remains failure/zero-call")
    require({item["path"]:(item["bytes"],item["sha256"]) for item in terminal["evidence"]}=={name:(record["bytes"],record["sha256"]) for name,record in frozen["evidence"].items() if name!="terminal.json"},f"{label} terminal evidence closure")
    return {"status":f"PASS_{label}_PRE_POPEN_FAILURE_ZERO_CREDIT_LINEAGE","qualification_credit":0,"no_retry":True,"subject_calls":0}
def verify_v11_pre_popen_failure_lineage()->dict[str,Any]: return verify_pre_popen_failure_lineage(11)
def verify_v12_pre_popen_failure_lineage()->dict[str,Any]: return verify_pre_popen_failure_lineage(12)
def verify_v13_post_popen_failure_lineage()->dict[str,Any]:
    frozen=spec()["v13_post_popen_failure_lineage"]; package=R10/"storage_glm53_max_fallback_qualification_v13"; root=package/"evidence"/"qualification_01"/"omp_glm53_flash_max"
    require(run_git("rev-parse",f"{frozen['source_commit']}^{{tree}}").stdout.strip()==frozen["source_tree_oid"] and run_git("rev-parse",f"{frozen['source_commit']}:{package.relative_to(REPO).as_posix()}").stdout.strip()==frozen["package_source_tree_oid"] and run_git("merge-base","--is-ancestor",frozen["source_commit"],"HEAD").returncode==0,"V13 source commit/tree lineage")
    require(set(frozen)=={"source_commit","source_tree_oid","package_source_tree_oid","attempt_id","nonce","error","status","qualification_credit","no_retry","popen_observed","evidence"} and frozen["status"]=="FAIL_POST_POPEN_CONSUMED_ZERO_CREDIT" and frozen["qualification_credit"]==0 and frozen["no_retry"] is frozen["popen_observed"] is True,"V13 frozen failure disposition")
    for name,expected in frozen["evidence"].items():
        path=package/"evidence"/name if name=="launch_journal.jsonl" else root/name
        require(file_record(path,path.parent)=={"path":name,"bytes":expected["bytes"],"sha256":expected["sha256"]},f"V13 {name} custody")
    reservation=P.load_json(root/"reservation.json"); failure=P.load_json(root/"runner_failure.json"); terminal=P.load_json(root/"terminal.json")
    require(all(value.get("attempt_id")==frozen["attempt_id"] and value.get("nonce")==frozen["nonce"] and value.get("qualification_credit")==0 for value in (reservation,failure,terminal)),"V13 failure identity/credit")
    require(reservation["retry_count"]==0 and failure["error"]==frozen["error"] and failure["no_retry"] is True and failure["popen_observed"] is True and type(failure["pid"]) is int and failure["pid"]>0,"V13 exact post-Popen failure")
    require(terminal["status"]=="FAIL" and terminal["failure_code"]=="RUNNER_OR_EVIDENCE_FAILURE" and terminal["no_retry"] is True and terminal["process_exit_code"] is None and terminal["qualification_credit"]==0,"V13 terminal remains consumed failure")
    return {"status":"PASS_V13_POST_POPEN_FAILURE_ZERO_CREDIT_LINEAGE","qualification_credit":0,"no_retry":True,"subject_calls":0}
def row_claimed(row: dict[str, Any]) -> bool:
    d=row_dir(row); return all(path.is_dir() and not path.is_symlink() for path in (EVIDENCE,d.parent,d))
def claim_after_failure(row: dict[str, Any], before: tuple[bool,bool,bool] | None) -> bool:
    d=row_dir(row); paths=(EVIDENCE,d.parent,d)
    if row_claimed(row): return True
    if before is None or not any(os.path.lexists(path) and not old for path,old in zip(paths,before,strict=True)): return False
    for path in paths:
        if not os.path.lexists(path): path.mkdir()
        require(path.is_dir() and not path.is_symlink(),"safe claim")
    return row_claimed(row)
def verify_selected_pipeline() -> dict[str,Any]:
    receipt=G.verify_input_snapshot(); require(G.SNAPSHOT_OWNED and receipt==G.SNAPSHOT_RECEIPT and receipt.get("materialized_root")==selected_row()["snapshot_dir"],"owned selected frozen root/receipt")
    require(receipt.get("commit")==spec()["snapshot"]["commit"] and receipt.get("entry_count")==6097 and receipt.get("complete_tree_roots")==["Plans","scripts"] and receipt.get("tree_oids")=={"Plans":G.PINNED_SNAPSHOT["plans_tree_oid"],"scripts":G.PINNED_SNAPSHOT["scripts_tree_oid"]} and receipt.get("roster_sha256")==G.PINNED_SNAPSHOT["roster_sha256"] and receipt.get("content_roster_sha256")==G.PINNED_SNAPSHOT["content_roster_sha256"] and receipt.get("total_blob_bytes")==G.PINNED_SNAPSHOT["total_blob_bytes"] and receipt.get("git_objects_only") is True and receipt.get("live_plans_open_or_read_count")==0,"exact complete pinned Git-object snapshot")
    report=G.PROXY.verify(); require(report.get("status")=="PASS_VERIFIED_NO_WORKNODES","full frozen pre-WorkNode pipeline"); require(G.verify_input_snapshot()==receipt,"snapshot stable across pipeline"); return receipt
def mixed_journal(journal: list[dict[str,Any]],reports: list[dict[str,Any]]) -> None:
    require(len(journal)==len(reports),"journal length")
    for report,actual in zip(reports,journal,strict=True):
        frozen=rows()[report["ordinal"]-1]; require(all(actual.get(k)==frozen[k] for k in IDENTITY),"journal identity"); require(actual["launch_sha256"]==report["launch_sha256"] and actual.get("omp_preflight_sha256")==report.get("omp_preflight_sha256"),"journal hashes")
def verify_diagnostic_launch_journal(grouped:list[dict[str,Any]])->None:
    require(len(grouped)==1 and grouped[0].get("pass_id")=="qualification_01" and len(grouped[0].get("rows",[]))==1,"one diagnostic journal report")
    report=grouped[0]["rows"][0]; journal_path=EVIDENCE/"launch_journal.jsonl"; require(journal_path.is_file() and not journal_path.is_symlink(),"diagnostic journal absent"); journal=P.load_jsonl(journal_path); require(len(journal)==1,"diagnostic journal exact length"); actual=journal[0]; planned=rows()[0]
    keys={"schema_id",*IDENTITY,"started_at_utc","launch_sha256","omp_preflight_sha256","popen_observed","pid"}; require(set(actual)==keys and actual["schema_id"]=="pm.r10.storage_pipeline.launch_journal.v2","diagnostic journal exact schema")
    require(actual["pass_id"]==planned["pass_id"]=="qualification_01" and all(actual[key]==planned[key]==report[key] for key in ("ordinal","route_id","attempt_id","nonce")) and actual["launch_sha256"]==report["launch_sha256"] and actual["omp_preflight_sha256"]==report["omp_preflight_sha256"] and actual["popen_observed"] is True and type(actual["pid"]) is int and actual["pid"]>0 and actual["pid"]==report["pid"],"diagnostic journal identity/hash/Popen joins")
    directory=row_dir(planned); reservation=P.load_json(directory/"reservation.json"); launch=P.load_json(directory/"launch.json"); terminal=P.load_json(directory/"terminal.json"); require(actual["started_at_utc"]==launch["started_at_utc"]==report["started_at_utc"] and V.parse_utc(reservation["reserved_at_utc"])<=V.parse_utc(actual["started_at_utc"])<=V.parse_utc(terminal["finished_at_utc"]),"diagnostic journal chronology")
def current_runtime_preflight() -> dict[str,Any]:
    runtime=spec()["runtime"]
    expected_config=runtime["source_effective_config"]
    require(expected_config=={"advisor.enabled":False,"autolearn.enabled":False,"goal.continuationModes":["interactive"],"goal.enabled":True,"mcp.enableProjectConfig":False,"memory.backend":"off","plan.defaultOnStartup":False,"task.agentAdvisor":{"task":"off"},"tools.approvalMode":"yolo"},"exact source effective config contract")
    original_spec=G.spec
    def source_spec()->dict[str,Any]:
        value=copy.deepcopy(spec()); value["runtime"]["effective_config"]=expected_config; return value
    try:
        G.spec=source_spec; receipt=G.current_runtime_preflight()
    finally:
        G.spec=original_spec
    require(set(receipt)=={"status","binary","binary_bytes","binary_sha256","binary_mode","version","profiles","effective_config","commands","subject_calls"},"runtime preflight receipt schema")
    require(receipt["status"]=="PASS_OMP_RUNTIME_18_0_7" and receipt["subject_calls"]==0 and {key:receipt[key] for key in ("binary","binary_bytes","binary_sha256","binary_mode","version")}=={key:runtime[key] for key in ("binary","binary_bytes","binary_sha256","binary_mode","version")},"runtime preflight binary identity")
    require(receipt["profiles"]=={"OMP_PROFILE":"default","PI_PROFILE":"default"} and receipt["effective_config"]==expected_config and len(receipt["commands"])==len(expected_config) and [item.get("key") for item in receipt["commands"]]==list(expected_config),"runtime preflight exact source effective config")
    return receipt
def write_hold(row: dict[str,Any],exc: BaseException) -> dict[str,Any]:
    hold={"schema_id":"pm.r10.storage_pipeline.fallback_hold.v14","ordinal":row["ordinal"],"error":f"{type(exc).__name__}: {exc}","captured_at_utc":base.utc_now(),"suffix_blocked":True,"pass_terminal_immutable":True,"qualification_credit":0}; path=EVIDENCE/"HOLD.json"
    if path.exists(): require(P.load_json(path)==hold or P.load_json(path).get("suffix_blocked") is True,"immutable HOLD")
    else: P.atomic_write(path,P.pretty_json(hold))
    return hold
def expected_prompt() -> str:
    frozen=(V7/"prompts/omp.prompt.txt").read_text()
    old=' and do not access files. You may give a short explanation, but the final nonempty line must be exactly one PM_RESULT <minified JSON> line. Use fields in this exact order: schema_id,source_match,plan_unit_count,acceptance_unit_count,dependency_registry_status,migration_coverage_status,canonical_comparison_status,pre_worknode_disposition,blocker_codes,no_worknodes_created. Use the schema_id pm.r10.storage_pipeline.subject_result.v1; copy every other value from its same-named admitted fact. No extra fields.'
    replacement='.\n\nYour assistant text must contain at least one line-start `PM_RESULT` followed immediately by JSON whitespace and then `{` starting one JSON object. Do not put a Markdown code-fence token or any other prose between `PM_RESULT` and `{`. That object must have exactly these ten keys and exactly these values, with no missing or additional keys:\n{"schema_id":"pm.r10.storage_pipeline.subject_result.v1","source_match":true,"plan_unit_count":248,"acceptance_unit_count":811,"dependency_registry_status":"resolved","migration_coverage_status":"pass","canonical_comparison_status":"pass","pre_worknode_disposition":"blocked","blocker_codes":["canonical_node_readiness_artifact_stale","pnc019_runtime_certification_incomplete"],"no_worknodes_created":true}\nObject-key order, JSON whitespace (including pretty multiline JSON), surrounding explanation, and candidate location are unrestricted. Keep the `blocker_codes` list order exact. Do not emit a conflicting `PM_RESULT` candidate.\n\nFor this bounded task, the admitted receipts are the complete authoritative evidence and are sufficient for the required decision; do not access files. Native Goal completion is mandatory in the same assistant turn as your result: emit the required `PM_RESULT` candidate, then make one actual call to the provided `goal` tool as `goal({"op":"complete"})`. Do not merely say that you will call it, do not end the assistant turn before the tool call, and do not retry it. Do not leave the Goal active.\n'
    require(frozen.endswith(old) and frozen.count(old)==1,"one authorized frozen prompt carrier"); return frozen[:-len(old)]+replacement
def validate_static(*, unused: bool = True) -> dict[str, Any]:
    contract, frozen, routes = spec(), rows(), list(route_map().values()); planned=frozen[0]
    normalization=contract["normalization"]; require(contract["schema_id"]=="pm.r10.storage_pipeline.glm53_max_fallback_qualification.v14" and contract["status"]=="FROZEN_PRELAUNCH_ZERO_CREDIT" and normalization["schema_id"]=="pm.r10.storage_pipeline.matrix_semantic_normalizer.v3" and normalization["source"]=="storage_glm53_max_fallback_qualification_v14/controller.py" and normalization["function"]=="semantic_normalize" and normalization["source_sha256"]==P.sha256_file(HERE/"controller.py") and normalization["benign"]==["object_key_order","json_whitespace","surrounding_prose","candidate_location"] and normalization["strict"]==["schema","types","values","list_order","duplicate_keys","nonfinite","malformed","marker_separator_bounds_1_to_64","candidate_before_goal_completion_call","post_call_markers","conflicts","zero_candidates"],"V14 contract/normalizer custody")
    request_response=contract["runtime"]["request_response_projection"]; require(request_response=={"schema_id":"pm.r10.storage_pipeline.glm_request_response_projection.v1","completed_pair_count":1,"post_exit_aborted_request_count":1,"response_http_status":200,"response_content_type":"text/event-stream","response_terminal":"DONE","response_finish_reason":"tool_calls","sole_tool":"goal","sole_tool_arguments":{"op":"complete"},"prelaunch_binding_schema_id":"pm.r10.storage_pipeline.glm_request_response_binding.v1","durable_replay_after_private_cleanup":True},"exact durable GLM request-response policy")
    actual={path.name for path in HERE.iterdir()}; require(actual==set(SOURCES) if unused else actual in (set(SOURCES),set(SOURCES)|{"evidence"}),"root roster")
    metrics={name:metric(HERE/name) for name in SOURCES}; limits=contract["architecture_limits"]; require(metrics["controller.py"]["lines"]<=limits["controller_max_lines"] and metrics["local_runtime.py"]["lines"]<=limits["local_runtime_max_lines"] and metrics["local_runtime_selftest.py"]["lines"]<=limits["local_runtime_selftest_max_lines"] and metrics["selftest.py"]["lines"]<=limits["selftest_max_lines"] and sum(x["lines"] for x in metrics.values())<=limits["package_max_lines"] and sum(x["bytes"] for x in metrics.values())<=limits["package_max_bytes"],"architecture limits")
    require(routes==[{"id":"omp_glm53_flash_max","model":"opencode-go/glm-5.3-flash","surface":"omp_tui","thinking":"max"}] and contract["route_order"]==[GLM_ROUTE] and planned["ordinal"]==1 and planned["pass_id"]=="qualification_01" and planned["route_id"]==GLM_ROUTE,"one GLM/max fallback row")
    require((PROMPT.stat().st_size,P.sha256_file(PROMPT))==(planned["prompt_utf8_bytes"],planned["prompt_sha256"])==(4006,"316a5af878ac5cda474505801f8089e44b27db18169185f195082844b3ef9616") and PROMPT.read_text()==expected_prompt(),"exact derived stable dev17/dev18 prompt")
    delta=contract["prompt_delta"]; require((delta["base_bytes"],delta["base_sha256"],delta["derived_bytes"],delta["derived_sha256"])==(3036,"eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638",4006,planned["prompt_sha256"]) and delta["authorized_delta"]=="replace_only_final_carrier_with_exact_ten-key_semantic_candidate_and_same-turn_goal-complete_paragraph","prompt delta custody")
    require(planned["evidence_path"]==f'evidence/{planned["pass_id"]}/{planned["route_id"]}' and planned["retry_count"]==planned["qualification_credit"]==0,"diagnostic row custody"); validate_omp_paths(planned)
    dependency=DB.verify(); require(contract["dependency_bootstrap"]=={key:dependency[key] for key in ("schema_id","commit","tree_oid","root","file_count","roster_sha256","content_roster_sha256","git_objects_only","live_tree_reads","directory_mode","regular_mode","executable_mode")} and contract["dependency_count"]==28 and contract["dependencies"]==[{"path":f"{DB.PREFIX}/{item['path']}","bytes":item["bytes"],"sha256":item["sha256"]} for item in dependency["files"]],"complete bootstrapped V7 dependency custody"); require(contract["snapshot"]=={"commit":G.SNAPSHOT_COMMIT,"entry_count":6097,"complete_tree_roots":["Plans","scripts"],"live_plans_reads":0,"read_only":True},"pinned snapshot contract")
    v7=contract["v7_runtime_custody"]; require(dependency["tree_oid"]==v7["tree_oid"]=="facc375e2335350d557eb9e51ccd0b076bbdba00" and v7=={"tree_oid":v7["tree_oid"],"freeze_manifest_file_count":27,"declared_dependency_count_including_manifest":28,"historical_controller_imports":0,"codex_lane_imports":0},"exact V7 tree/no historical runtime imports")
    runtime_source=(HERE/"local_runtime.py").read_text(); controller_source=(HERE/"controller.py").read_text(); combined=runtime_source+controller_source; import_lines="\n".join(line for line in combined.splitlines() if re.match(r"^\s*(?:from|import)\s",line)); require(all(token not in import_lines for token in ("storage_normalized_matrix_v6","storage_mimo_normalized_canary_v3","storage_native_matrix_v2","storage_mimo_native_canary_v1","codex_app_lane","importlib")),"historical controller/Codex imports absent")
    local=contract["local_runtime_custody"]; require(local["source"]==file_record(HERE/"local_runtime.py",HERE) and local["selftest"]==file_record(HERE/"local_runtime_selftest.py",HERE) and local["imports_only_pinned_v7"] is True and local["historical_controller_imports"]==local["subject_calls"]==0,"local runtime/selftest exact custody")
    fork=contract["v6_fork_custody"]; require(fork["commit"]=="7a83f6d2d662d17b52c62e117d79242da1a9dda0" and run_git("merge-base","--is-ancestor",fork["commit"],"HEAD").returncode==0,"V6 fork ancestry"); require(all({key:pinned_record(fork["commit"],record["path"])[0][key] for key in ("path","bytes","sha256")}==record for record in (fork["controller"],fork["contract"],fork["failure_review"])),"V6 fork/failure-review blobs")
    review=pinned_json(fork["commit"],fork["failure_review"]["path"])[1]; evidence=review["evidence_custody"]; require(review["outcome"]["status"]=="FAIL_CONSUMED_STOP_SUFFIX" and review["outcome"]["no_retry"] is True and review["outcome"]["qualification_credit"]==0 and {name:{key:evidence[name][key] for key in ("bytes","sha256")} for name in ("journal","terminal","runner_failure","postfailure_session")}==fork["failure_evidence"],"V6 exact failure terminal/journal/postfailure lineage")
    runtime=contract["runtime"]; require(runtime["native_goal_completion_count"]==1 and runtime["provided_goal_complete_arguments"]=={"op":"complete"} and runtime["retry_count"]==runtime["qualification_credit"]==runtime["suffix_row_count"]==0 and runtime["terminal_control"]=="CTRL_D_ONCE_AFTER_FINAL" and runtime["normal_exit_required"] is True,"exact diagnostic lifecycle")
    require(runtime["post_exit_teardown_tail"]=={"schema_id":"pm.r10.storage_pipeline.post_exit_teardown_tail.v14","minimum_entries":1,"maximum_entries":4,"maximum_raw_jsonl_bytes":8192,"same_session_parent_chain":True,"timestamps_not_before_exit":True,"assistant_only":True,"allowed_stop_reasons":["aborted","error"],"nonempty_error_metadata":True,"optional_response_id":True,"optional_thinking_blocks":True,"visible_text_forbidden":True,"tools_and_goal_forbidden":True,"pm_result_forbidden":True,"additional_exit_forbidden":True,"semantic_credit":False,"lifecycle_credit":False,"usage_credit":0},"exact bounded post-exit teardown policy")
    require(contract["profile_roster_semantics"]=={"pre_config_query_exact_files":["agent.db","config.yml","models.db","models.yml"],"pre_config_query_mode":"0o600","immediate_seed_capture_before_any_omp_process":True,"immutable_across_queries":True,"post_config_query_optional_files":["agent.db-shm","agent.db-wal"],"optional_files_regular_non_symlink":True,"optional_files_mode":"0o600","optional_file_bytes_and_sha_bound":True,"preflight_profile_state_bound":True,"optional_files_role":"runtime_sqlite_sidecars_not_source_config","all_other_entries_forbidden":True},"exact V14 profile roster semantics")
    require(runtime["models_yml"]=={"bytes":144,"sha256":"f1a585a1ec9c1a89f2d7533322bad3b7897117cd5fe3e1899bf6bf1139969a69","mode":"0o600","git_commit":"4beba8892ec3fd82a5b83c6ec403b4ebd56e7512","git_blob":"f71494ecbb66cbed545bdfa72bd09de0b65cf971"} and runtime["pi_req_debug_required_for_request_custody"] is runtime["private_http_capture_required"] is True and runtime["models_yml_forbidden"] is False,"exact GLM models/request capture contract")
    config={"advisor.enabled":False,"autolearn.enabled":False,"goal.continuationModes":[],"goal.enabled":True,"mcp.enableProjectConfig":False,"memory.backend":"off","plan.defaultOnStartup":False,"recap.enabled":False,"task.agentAdvisor":{"task":"off"},"tools.approvalMode":"yolo"}; source_config=dict(config); source_config.pop("recap.enabled"); source_config["goal.continuationModes"]=["interactive"]; require({key:runtime[key] for key in ("binary","binary_bytes","binary_mode","binary_sha256","version","source_profile_dir","effective_config","source_effective_config")}=={"binary":"/home/sittingmongoose/.local/bin/omp","binary_bytes":183686344,"binary_mode":"0o755","binary_sha256":"4e2468ad6974e6a2edea621da82abca8c95ec62a8354630381c353dc08c7769b","version":"omp/18.0.7","source_profile_dir":"/home/sittingmongoose/.omp/pmdev-r10-simple-canary-v1","effective_config":config,"source_effective_config":source_config},"exact OMP 18.0.7 GLM/max runtime contract")
    binary=Path(runtime["binary"]); profile=Path(runtime["source_profile_dir"]); require(binary.is_file() and not binary.is_symlink() and stat.S_ISREG(binary.lstat().st_mode) and (binary.stat().st_size,P.sha256_file(binary),oct(binary.stat().st_mode&0o777))==(runtime["binary_bytes"],runtime["binary_sha256"],runtime["binary_mode"]) and profile.is_dir() and not profile.is_symlink(),"current read-only OMP binary/profile identity")
    require(contract["catalog_gate"]=={"enabled":False,"expected_assistant_api":"openai-completions","reason":"GLM fallback uses exact committed models.yml override; no MiMo free catalog gate"},"GLM has no MiMo catalog gate")
    historical_identity_clean(frozen); verified_authority(); verify_v8_prelaunch_failure_lineage(); verify_development_lineage(); verify_v10_hold_lineage(); verify_v11_pre_popen_failure_lineage(); verify_v12_pre_popen_failure_lineage(); verify_v13_post_popen_failure_lineage()
    if unused: require(not os.path.lexists(EVIDENCE) and not any(os.path.lexists(path) for path in runtime_paths(planned)),"unused diagnostic")
    return {"status":"PASS_FALLBACK_V14_PRELAUNCH","rows":1,"subject_calls":0,"qualification_credit":0,"metrics":metrics}
@contextlib.contextmanager
def selected(row: dict[str, Any]) -> Iterator[None]:
    global CURRENT_ROW
    prior = CURRENT_ROW
    CURRENT_ROW = row
    try:
        yield
    finally:
        CURRENT_ROW = prior
def glm_rows() -> list[dict[str, Any]]:
    return [selected_row()]
def expected_argv(route: dict[str, Any], row: dict[str, Any]) -> list[str]:
    return G.with_no_extensions(G.ORIGINAL_EXPECTED_ARGV(route, row))
def verify_expected_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    return G.with_no_extensions(G.ORIGINAL_VERIFY_ARGV(route, cwd, session_dir))
def popen_state_sha256(value:dict[str,Any])->str:
    return P.sha256_bytes((P.canonical_json(value)+"\n").encode())
def profile_phase_records(profile:Path,seed_records:list[dict[str,Any]])->tuple[list[dict[str,Any]],list[dict[str,Any]]]:
    allowed={"agent.db","config.yml","models.db","models.yml","agent.db-shm","agent.db-wal"}; base={"agent.db","config.yml","models.db","models.yml"}; entries=sorted(profile.iterdir(),key=lambda item:item.name); names={item.name for item in entries}
    require(base<=names<=allowed,"closed post-seed profile roster")
    records=[]
    for item in entries:
        require(item.is_file() and not item.is_symlink() and stat.S_ISREG(item.lstat().st_mode) and (item.stat().st_mode&0o777)==0o600 and item.stat().st_nlink==1,"safe post-seed profile file"); records.append({"path":item.name,"mode":"0o600","bytes":item.stat().st_size,"sha256":P.sha256_file(item)})
    seed={Path(item["path"]).name:{key:item[key] for key in ("path","mode","bytes","sha256")} for item in seed_records}; current={item["path"]:item for item in records}; require(set(seed)==base and all(current[name]=={"path":name,"mode":seed[name]["mode"],"bytes":seed[name]["bytes"],"sha256":seed[name]["sha256"]} for name in base),"immutable four profile files match pre-query seed receipt")
    return [current[name] for name in ("agent.db","config.yml","models.db","models.yml")],[current[name] for name in ("agent.db-shm","agent.db-wal") if name in current]
def finalize_popen_state(row:dict[str,Any],route:dict[str,Any],argv:list[str])->dict[str,Any]:
    directory=row_dir(row); path=directory/"omp_preflight.json"; initial=P.load_json(path); require("popen_state_receipt" not in initial,"fresh Popen state finalization")
    runtime=spec()["runtime"]; binary=Path(runtime["binary"]); require(binary.is_file() and not binary.is_symlink() and stat.S_ISREG(binary.lstat().st_mode),"Popen-state binary")
    binary_record={"path":str(binary),"bytes":binary.stat().st_size,"sha256":P.sha256_file(binary),"mode":oct(binary.stat().st_mode&0o777)}; require(binary_record=={"path":runtime["binary"],"bytes":runtime["binary_bytes"],"sha256":runtime["binary_sha256"],"mode":runtime["binary_mode"]},"Popen-state binary identity")
    environment=G.isolated_env(dict(os.environ)); version=G.ORIGINAL_RUN([str(binary),"--version"],check=False,capture_output=True,text=True,env=environment,timeout=30); require(version.returncode==0 and version.stderr=="" and version.stdout.strip()==runtime["version"],"Popen-state version")
    profile=Path(row["profile_dir"]); require(profile.is_dir() and not profile.is_symlink(),"Popen-state profile root"); immutable_records,_prior_sidecars=profile_phase_records(profile,initial["profile_seed"]["seed_records"]); prior_phase=initial.get("preflight_profile_state",{}); require(prior_phase.get("immutable_profile_records")==immutable_records and isinstance(prior_phase.get("sqlite_sidecar_records"),list),"Popen state joins preflight profile phase")
    effective=runtime["effective_config"]; commands=[]; observed={}
    for key,expected in effective.items():
        process=G.ORIGINAL_RUN([str(binary),"config","get",key],check=False,capture_output=True,text=True,env=environment,timeout=30); raw=process.stdout.strip(); require(process.returncode==0 and process.stderr=="","Popen-state config command"); value=P.strict_loads(raw) if raw in {"true","false"} or raw.startswith(("{","[",'"')) else raw; require(value==expected,"Popen-state effective config value"); observed[key]=value; commands.append({"key":key,"argv":[str(binary),"config","get",key],"exit_code":0,"stdout":raw})
    require(observed==effective and observed["advisor.enabled"] is False and observed["task.agentAdvisor"]=={"task":"off"},"Popen-state advisors/effective config")
    immutable_records,sidecars=profile_phase_records(profile,initial["profile_seed"]["seed_records"])
    models=next(item for item in immutable_records if item["path"]=="models.yml"); override=runtime["models_yml"]; require((models["bytes"],models["sha256"],models["mode"])==(override["bytes"],override["sha256"],override["mode"]),"Popen-state models override")
    require(argv==expected_argv(route,row),"Popen-state argv"); custody=git_custody(); require(DISPATCH_CUSTODY is not None and custody==DISPATCH_CUSTODY==initial["git_custody"],"Popen-state source custody"); authority=verified_authority(); authority_sha=P.sha256_bytes((P.canonical_json(authority)+"\n").encode())
    dependency=DB.verify(); require(dependency==DEPENDENCY_RECEIPT and dependency["file_count"]==28,"Popen-state dependency snapshot"); dependency_sha=P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()); snapshot=G.verify_input_snapshot(); require(snapshot==initial["input_snapshot"]==G.SNAPSHOT_RECEIPT and snapshot["entry_count"]==6097 and snapshot["git_objects_only"] is True and snapshot["live_plans_open_or_read_count"]==0,"Popen-state 6097 snapshot"); snapshot_sha=G.snapshot_digest(snapshot); require(snapshot_sha==initial["input_snapshot_sha256"],"Popen-state snapshot digest")
    state={"schema_id":"pm.r10.storage_pipeline.popen_state_receipt.v14","observed_at_utc":base.utc_now(),"initial_preflight_sha256":P.sha256_file(path),"binary":binary_record,"version":{"argv":[str(binary),"--version"],"exit_code":0,"stdout":runtime["version"]},"profile_dir":str(profile),"immutable_profile_records":immutable_records,"sqlite_sidecar_records":sidecars,"effective_config":observed,"config_commands":commands,"advisor_enabled":False,"task_agent_advisor":{"task":"off"},"models_override":override,"argv":argv,"source_custody":custody,"authority":authority,"authority_sha256":authority_sha,"dependency_snapshot":dependency,"dependency_snapshot_sha256":dependency_sha,"input_snapshot":snapshot,"input_snapshot_sha256":snapshot_sha,"catalog_refresh":None,"mimo_catalog_api_gate":False,"subject_popen_count_before":0}
    final=copy.deepcopy(initial); final["popen_state_receipt"]=state; final["popen_state_receipt_sha256"]=popen_state_sha256(state); P.atomic_write(path,P.pretty_json(final)); require(P.load_json(path)==final,"atomic finalized Popen preflight"); return final
class SubprocessProxy:
    def __getattr__(self, name: str) -> Any:
        return getattr(subprocess, name)
    def run(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv, list) and argv and argv[0] == P.load_json(V7 / "runtime_manifest.json")["omp"]["binary"]:
            kwargs["env"] = G.isolated_env(dict(kwargs.get("env") or os.environ))
        return G.ORIGINAL_RUN(argv, *args, **kwargs)
    def Popen(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv, list) and "--model" in argv:
            row, route = selected_row(), route_map()[selected_row()["route_id"]]
            permanent(Path(kwargs.get("cwd", "")).resolve()==V7.resolve(), "exact V7 runtime cwd")
            dependency=DB.verify(); permanent(dependency==DEPENDENCY_RECEIPT,"dependency snapshot before Popen")
            permanent(argv == expected_argv(route, row) and "--config" not in argv and "--no-extensions" in argv, "exact OMP argv")
            permanent(DISPATCH_CUSTODY == git_custody(), "custody before Popen")
            preflight=P.load_json(row_dir(row)/"omp_preflight.json"); snapshot=G.verify_input_snapshot(); permanent(preflight.get("git_custody")==DISPATCH_CUSTODY and preflight.get("input_snapshot")==snapshot and preflight.get("input_snapshot_sha256")==G.snapshot_digest(snapshot),"preflight/Popen custody and snapshot")
            env = G.isolated_env(dict(kwargs["env"]))
            permanent(env["PI_CODING_AGENT_DIR"] == row["profile_dir"] and env["OMP_PROFILE"] == env["PI_PROFILE"] == "default", "isolated profile")
            permanent(not os.path.lexists(Path(row["home_dir"]) / ".cursor"), "host Cursor excluded")
            if row["model"]=="opencode-go/glm-5.3-flash": env["PI_REQ_DEBUG"]="1"
            else: env.pop("PI_REQ_DEBUG", None)
            kwargs["env"] = env
            finalize_popen_state(row,route,argv)
        return G.ORIGINAL_POPEN(argv, *args, **kwargs)
SPROXY = SubprocessProxy()
def row_preflight(path: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    seed = G.prepare_profile()
    seed_base,seed_sidecars=profile_phase_records(Path(row["profile_dir"]),seed["seed_records"]); require(seed_sidecars==[],"no SQLite sidecars before first OMP/config process")
    original_load=P.load_json
    def scoped_load_json(target:Path)->Any:
        value=original_load(target)
        if Path(target).resolve()==(V7/"runtime_manifest.json").resolve():
            value=copy.deepcopy(value); value["omp"]["profile_dir"]=row["profile_dir"]; value["omp"]["effective_config"]=spec()["runtime"]["effective_config"]
        return value
    try:
        P.load_json=scoped_load_json
        receipt = G.ORIGINAL_PREFLIGHT(path, row, route)
    finally:
        P.load_json=original_load
    require(DISPATCH_CUSTODY is not None and git_custody() == DISPATCH_CUSTODY, "custody before preflight")
    require(receipt["effective_config"]["advisor.enabled"] is False and receipt["effective_config"]["task.agentAdvisor"] == {"task": "off"}, "advisor controls off")
    catalog = None
    snapshot=verify_selected_pipeline()
    dependency=DB.verify(); require(dependency==DEPENDENCY_RECEIPT,"dependency snapshot before preflight")
    controls={}; commands=[]; environment=G.isolated_env(dict(os.environ)); binary=spec()["runtime"]["binary"]
    for key, expected in (("goal.continuationModes", []), ("recap.enabled", False)):
        process=G.ORIGINAL_RUN([binary,"config","get",key],check=False,capture_output=True,text=True,env=environment,timeout=30); raw=process.stdout.strip(); require(process.returncode==0 and process.stderr=="","isolated Goal/recap config command"); value=P.strict_loads(raw); require(value==expected,"isolated Goal/recap controls"); controls[key]=value; commands.append({"key":key,"exit_code":process.returncode,"stdout":raw})
    preflight_base,preflight_sidecars=profile_phase_records(Path(row["profile_dir"]),seed["seed_records"]); require(preflight_base==seed_base,"preflight immutable base equals immediate seed capture")
    receipt.update({"matrix_contract": file_record(CONTRACT), "owned_sources": DISPATCH_CUSTODY["sources"], "dependency_custody": DISPATCH_CUSTODY["dependencies"], "dependency_snapshot":dependency,"dependency_snapshot_sha256":P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()),"git_custody": DISPATCH_CUSTODY, "profile_seed": seed,"preflight_profile_state":{"immutable_profile_records":preflight_base,"sqlite_sidecar_records":preflight_sidecars}, "protocol_adapter": "native_default_semantic_v10", "config_overlay": seed["config_overlay"], "isolated_goal_controls":{"values":controls,"commands":commands}, "catalog_refresh": None, "mimo_catalog_api_gate": False, "row_time_budget_seconds": 3600, "expected_argv": expected_argv(route, row), "qualification_credit": 0, "input_snapshot": snapshot, "input_snapshot_sha256": G.snapshot_digest(snapshot),"request_response_projection_binding":G.request_response_binding()})
    G.ORIGINAL_ATOMIC(path / "omp_preflight.json", receipt)
    return receipt
def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
    if False:
        return G.composer_transition(before, after)
    permanent(isinstance(before, bytes) and isinstance(after, bytes) and before and after.startswith(before), "composer snapshot")
    pre, post, delta = base.strip_terminal(before), base.strip_terminal(after), base.strip_terminal(after[len(before):])
    markers = ("📄 #1".encode(), b"/goal Audit", "❯ 📄 #1".encode())
    submitted = row_dir() / "stdin_prompt.raw"
    permanent(submitted.is_file() and not submitted.is_symlink() and submitted.read_bytes() == PROMPT.read_bytes(), "submitted prompt")
    permanent(G.PROMPT_READY in pre and G.MCP_SENTINEL not in pre and G.MCP_SENTINEL not in post and all(marker not in pre for marker in markers), "empty-MCP pre-composer")
    if selected_row()["model"]=="opencode-go/glm-5.3-flash": permanent(G.VISIBLE_SELECTION in pre and b"xhigh" not in post.lower(),"literal GLM/max TUI selection")
    previews, cards = re.findall(rb"/goal ([A-Za-z]+)", delta), re.findall("📄 #([0-9]+)".encode(), delta)
    ready = all(marker in post for marker in markers) and len(after) > len(before)
    permanent(all(b"Audit".startswith(value) for value in previews) and all(value == b"1" for value in cards) and (not ready or (previews[-1:] == [b"Audit"] and cards[-1:] == [b"1"])), "composer contradiction")
    if not ready:
        raise base.RunnerError("prompt-specific composer transition pending")
    return {"mcp_startup_finished": False, "mcp_finished_banner_observed": False, "prompt_ready_observed": True, "prompt_ready_glyph": "❯", "prompt_card": "📄 #1", "prompt_preview": "/goal Audit", "composer_state": "❯ 📄 #1", "pre_prompt_bytes": len(before), "pre_prompt_sha256": P.sha256_bytes(before), "new_raw_bytes": len(after) - len(before)}
def session_health(path: Path) -> bool:
    _slot, _header, entries, _raw = omp_session.load_physical_session(path)
    terminal = False
    for entry in entries:
        message = entry.get("message") if entry.get("type") == "message" else None
        if isinstance(message, dict) and message.get("role") == "assistant":
            permanent(message.get("retryRecovery") is None and message.get("stopReason") != "error", "retry/provider error is permanent")
        terminal |= entry.get("type") == "custom" and entry.get("customType") == "session_exit"
    assistants=[entry["message"] for entry in entries if entry.get("type")=="message" and isinstance(entry.get("message"),dict) and entry["message"].get("role")=="assistant"]
    goals=[entry.get("data",{}).get("goal") for entry in entries if entry.get("type")=="mode_change" and entry.get("mode")=="goal"]
    if assistants and goals and isinstance(goals[-1],dict) and goals[-1].get("status")=="active" and assistants[-1].get("stopReason")=="stop":
        calls=[block for block in assistants[-1].get("content",[]) if isinstance(block,dict) and block.get("type")=="toolCall"]
        permanent(calls,"assistant stopped with active Goal and no mandatory completion call")
    return terminal
def semantic_normalize(path: Path, structural: dict[str,Any], *, oracle_path: Path, schema_path: Path, max_text_block_utf8_bytes: int) -> dict[str,Any]:
    oracle=P.load_json(oracle_path); schema=P.load_json(schema_path); canonical=P.RESULT_PREFIX+oracle_path.read_text().strip(); _slot,_header,entries,_raw=omp_session.load_physical_session(path)
    shutdown_ids=set(structural.get("post_exit_shutdown_tail",{}).get("entry_ids",[])); assistants=[(i,e,e["message"]) for i,e in enumerate(entries) if e.get("id") not in shutdown_ids and e.get("type")=="message" and isinstance(e.get("message"),dict) and e["message"].get("role")=="assistant"]
    permanent(len(assistants)==structural.get("assistant_message_count") and assistants,"semantic assistant roster")
    def pairs(items:list[tuple[str,Any]])->dict[str,Any]:
        result={}
        for key,value in items:
            if key in result: raise ValueError(f"duplicate key: {key}")
            result[key]=value
        return result
    def nonfinite(value:str)->Any: raise ValueError(f"nonfinite: {value}")
    decoder=json.JSONDecoder(object_pairs_hook=pairs,parse_constant=nonfinite); marker_tokens=re.compile(r"(?m)^[ \t]*PM_RESULT(?![A-Za-z0-9_])"); candidates=[]; marker_records=[]; text_records=[]; total=0
    goal_calls=[]
    for assistant_ordinal,(entry_index,entry,message) in enumerate(assistants,1):
        content=message.get("content")
        permanent(isinstance(content,list),"assistant content list")
        for block_index,block in enumerate(content):
            if isinstance(block,dict) and block.get("type")=="toolCall" and block.get("name")=="goal":
                permanent(block.get("arguments")=={"op":"complete"},"exact Goal completion arguments")
                goal_calls.append({"assistant_ordinal":assistant_ordinal,"entry_index":entry_index,"entry_id":entry.get("id"),"message_id":message.get("id"),"block_index":block_index,"tool_call_id":block.get("id")})
    permanent(len(goal_calls)==1,"sole physical Goal completion call")
    goal_call=goal_calls[0]
    for assistant_ordinal,(entry_index,entry,message) in enumerate(assistants,1):
        content=message.get("content"); permanent(isinstance(content,list),"assistant content list")
        for block_index,block in enumerate(content):
            if not isinstance(block,dict) or block.get("type")!="text": continue
            text=block.get("text"); permanent(isinstance(text,str) and len(text.encode())<=max_text_block_utf8_bytes,"bounded assistant text"); total+=len(text.encode()); text_records.append({"assistant_ordinal":assistant_ordinal,"entry_index":entry_index,"entry_id":entry.get("id"),"message_id":message.get("id"),"block_index":block_index,"utf8_bytes":len(text.encode()),"sha256":P.sha256_bytes(text.encode())})
            for match in marker_tokens.finditer(text):
                location=f"assistant={assistant_ordinal} entry={entry_index} block={block_index} char={match.start()} byte={len(text[:match.start()].encode())}"
                payload_start=match.end(); separator_end=payload_start
                while separator_end<len(text) and text[separator_end] in " \t\r\n" and separator_end-payload_start<65: separator_end+=1
                separator_bytes=text[payload_start:separator_end].encode()
                permanent(1<=separator_end-payload_start<=64 and not (separator_end<len(text) and text[separator_end] in " \t\r\n"),f"PM_RESULT exact 1..64 ASCII JSON whitespace at {location}")
                permanent(separator_end<len(text) and text[separator_end]=="{",f"PM_RESULT object grammar at {location}")
                try: value,end=decoder.raw_decode(text,separator_end)
                except Exception as exc: raise PermanentMatrixError(f"invalid PM_RESULT candidate at {location}: {type(exc).__name__}: {exc}") from exc
                line_end=text.find("\n",end); line_end=len(text) if line_end<0 else line_end; permanent(not text[end:line_end].strip(" \t\r"),"extra same-line PM_RESULT payload")
                N.validate_schema(value,schema); start=match.start(); raw=text[start:line_end].encode(); provenance={"assistant_ordinal":assistant_ordinal,"entry_index":entry_index,"entry_id":entry.get("id"),"message_id":message.get("id"),"block_index":block_index,"marker_offset_chars":start,"marker_offset_utf8_bytes":len(text[:start].encode()),"payload_offset_chars":separator_end,"payload_offset_utf8_bytes":len(text[:separator_end].encode()),"separator_utf8_bytes":len(separator_bytes),"line_index":text.count("\n",0,start)+1,"end_line_index":text.count("\n",0,end)+1,"raw_span":text[start:line_end],"raw_span_utf8_bytes":len(raw),"raw_span_sha256":P.sha256_bytes(raw)}
                permanent((entry_index,block_index)<(goal_call["entry_index"],goal_call["block_index"]),"every PM_RESULT marker strictly precedes Goal completion call")
                marker_records.append(provenance); candidates.append((value,provenance))
    permanent(total<=max_text_block_utf8_bytes*len(assistants),"bounded aggregate assistant text"); permanent(candidates,"at least one PM_RESULT candidate"); first=candidates[0][0]; permanent(all(N.typed_equal(first,value) for value,_ in candidates[1:]),"conflicting PM_RESULT candidates"); permanent(N.typed_equal(first,oracle),"PM_RESULT differs from oracle")
    raw_last=structural.get("final_text"); permanent(isinstance(raw_last,str),"raw final text"); projection=dict(structural); projection.update({"raw_last_assistant_text":raw_last,"raw_last_assistant_utf8_bytes":len(raw_last.encode()),"raw_last_assistant_sha256":P.sha256_bytes(raw_last.encode()),"verified_assistant_text_blocks":text_records,"verified_assistant_text_utf8_bytes":total,"goal_completion_call_provenance":goal_call,"result_normalization":{"schema_id":"pm.r10.storage_pipeline.result_normalization.v3","result_authority":"deterministic_matrix_host_program_over_verified_assistant_text","marker_count":len(marker_records),"marker_provenance":marker_records,"candidate_count":len(candidates),"candidates":[record for _,record in candidates],"canonical_text":canonical,"canonical_utf8_bytes":len(canonical.encode()),"canonical_sha256":P.sha256_bytes(canonical.encode()),"raw_session_preserved":True,"surrounding_prose_authoritative":False,"object_key_order_authoritative":False,"list_order_authoritative":True,"all_candidates_strictly_before_goal_complete":True},"final_text":canonical,"final_text_sha256":P.sha256_bytes(canonical.encode())}); return projection
def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    if selected_row()["route_id"] == GLM_ROUTE or selected_row()["model"]=="opencode-go/glm-5.3-flash":
        return G.verify_session(path, **expected)
    terminal_hint = session_health(path)
    original_require = omp_session.require
    cursor = selected_row()["route_id"] == "omp_cursor_default_auto"
    skipped: list[str] = []
    messages = {"OMP Cursor aggregate result absent before Goal call", "OMP Cursor aggregate result follows Goal call"}
    source = V7 / "omp_session.py"; dependency = next(item for item in spec()["dependencies"] if item["path"].endswith("system_pipeline_sandbox_v7/omp_session.py"))
    permanent(file_record(source) == dependency and all(source.read_text().count(message) == 1 for message in messages), "pinned two-call Cursor source")
    def scoped_require(value: bool, message: str) -> None:
        if cursor and message in messages:
            skipped.append(message); return
        original_require(value, message)
    try:
        omp_session.require = scoped_require
        structural = G.ORIGINAL_SESSION(path, **expected)
    except omp_session.OmpSessionError as exc:
        if terminal_hint:
            raise PermanentMatrixError(f"terminal structural failure: {exc}") from exc
        raise
    finally:
        omp_session.require = original_require
    if cursor: permanent(sorted(skipped) == sorted(messages), "exactly two Cursor location calls disabled")
    normalized = semantic_normalize(path, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
    if expected.get("require_exit") is True:
        for name, value in (("structural_projection.json", structural), ("normalized_projection.json", normalized)):
            target=row_dir()/name
            if target.exists(): permanent(P.load_json(target)==value,f"immutable {name}")
            else: P.atomic_write(target,P.pretty_json(value))
    return normalized
def verify_omp_raw(path: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    receipt=P.load_json(path/"composer_ack.json"); pre=base.strip_terminal((path/"pre_prompt.raw").read_bytes()); composer=base.strip_terminal((path/"composer_ack.raw").read_bytes())
    permanent(receipt.get("prompt_ready_observed") is True and receipt.get("mcp_startup_finished") is False and receipt.get("mcp_finished_banner_observed") is False,"truthful no-MCP prompt readiness")
    permanent(G.MCP_SENTINEL not in pre and G.MCP_SENTINEL not in composer,"late/fabricated MCP banner forbidden")
    return G.PROMPT_READY_VERIFY_OMP_RAW(path, route, launch, terminal)
def verify_popen_state(preflight:dict[str,Any],launch:dict[str,Any],planned:dict[str,Any],custody:dict[str,Any]|None=None)->dict[str,Any]:
    require(launch.get("final_omp_preflight_sha256")==P.sha256_bytes(P.pretty_json(preflight)),"launch binds exact finalized preflight")
    state=preflight.get("popen_state_receipt"); keys={"schema_id","observed_at_utc","initial_preflight_sha256","binary","version","profile_dir","immutable_profile_records","sqlite_sidecar_records","effective_config","config_commands","advisor_enabled","task_agent_advisor","models_override","argv","source_custody","authority","authority_sha256","dependency_snapshot","dependency_snapshot_sha256","input_snapshot","input_snapshot_sha256","catalog_refresh","mimo_catalog_api_gate","subject_popen_count_before"}; require(isinstance(state,dict) and set(state)==keys and state["schema_id"]=="pm.r10.storage_pipeline.popen_state_receipt.v14" and preflight.get("popen_state_receipt_sha256")==popen_state_sha256(state),"exact Popen-state receipt schema/hash")
    initial=copy.deepcopy(preflight); initial.pop("popen_state_receipt"); initial.pop("popen_state_receipt_sha256"); require(state["initial_preflight_sha256"]==P.sha256_bytes(P.pretty_json(initial)),"initial-to-final preflight hash")
    runtime=spec()["runtime"]; binary=state["binary"]; require(binary=={"path":runtime["binary"],"bytes":runtime["binary_bytes"],"sha256":runtime["binary_sha256"],"mode":runtime["binary_mode"]},"Popen-state binary replay"); require(state["version"]=={"argv":[runtime["binary"],"--version"],"exit_code":0,"stdout":runtime["version"]},"Popen-state version replay")
    records=state["immutable_profile_records"]; sidecars=state["sqlite_sidecar_records"]; shape=lambda item:set(item)=={"path","mode","bytes","sha256"} and item["mode"]=="0o600" and type(item["bytes"]) is int and item["bytes"]>=0 and re.fullmatch(r"[0-9a-f]{64}",item["sha256"]); require(state["profile_dir"]==planned["profile_dir"] and isinstance(records,list) and [item["path"] for item in records]==["agent.db","config.yml","models.db","models.yml"] and all(shape(item) for item in records) and isinstance(sidecars,list) and [item["path"] for item in sidecars] in ([],["agent.db-shm"],["agent.db-wal"],["agent.db-shm","agent.db-wal"]) and all(shape(item) for item in sidecars),"Popen-state profile/sidecar roster replay")
    seeds={Path(item["path"]).name:item for item in preflight["profile_seed"]["seed_records"]}; require(len(seeds)==4 and all((item["mode"],item["bytes"],item["sha256"])==(seeds[item["path"]]["mode"],seeds[item["path"]]["bytes"],seeds[item["path"]]["sha256"]) for item in records),"Popen-state immutable profile hashes/modes replay"); models=next(item for item in records if item["path"]=="models.yml"); require(state["models_override"]==runtime["models_yml"] and (models["bytes"],models["sha256"],models["mode"])==(runtime["models_yml"]["bytes"],runtime["models_yml"]["sha256"],runtime["models_yml"]["mode"]),"Popen-state models override replay")
    effective=runtime["effective_config"]; expected_commands=[]
    for key,value in effective.items(): expected_commands.append({"key":key,"argv":[runtime["binary"],"config","get",key],"exit_code":0,"stdout":P.canonical_json(value) if isinstance(value,(dict,list,bool)) else str(value)})
    require(state["effective_config"]==effective and state["config_commands"]==expected_commands and state["advisor_enabled"] is False and state["task_agent_advisor"]=={"task":"off"},"Popen-state effective config/advisors replay"); require(state["argv"]==expected_argv(route_map()[planned["route_id"]],planned),"Popen-state argv replay")
    require(state["source_custody"]==(custody or preflight["git_custody"]) and state["authority"]==verified_authority() and state["authority_sha256"]==P.sha256_bytes((P.canonical_json(state["authority"])+"\n").encode()),"Popen-state source/authority replay")
    dependency=DB.verify(); require(state["dependency_snapshot"]==dependency and state["dependency_snapshot_sha256"]==P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()) and dependency["file_count"]==28,"Popen-state dependency replay"); snapshot=G.verify_input_snapshot(); require(state["input_snapshot"]==snapshot and state["input_snapshot_sha256"]==G.snapshot_digest(snapshot) and snapshot["entry_count"]==6097,"Popen-state snapshot replay"); require(state["catalog_refresh"] is None and state["mimo_catalog_api_gate"] is False and state["subject_popen_count_before"]==0,"Popen-state catalog/Popen count")
    require(V.parse_utc(preflight["observed_at_utc"])<=V.parse_utc(launch["started_at_utc"])<=V.parse_utc(state["observed_at_utc"]),"preflight <= launch <= Popen state chronology"); return state
def verify_dev_omp_preflight(directory: Path, launch: dict[str, Any], planned: dict[str, Any]) -> str:
    path=directory/"omp_preflight.json"; require(path.is_file() and not path.is_symlink() and path.stat().st_size==launch.get("omp_preflight_bytes"),"row-bound OMP preflight")
    digest=P.sha256_file(path); require(digest==launch.get("omp_preflight_sha256"),"OMP preflight hash"); receipt=P.load_json(path)
    require(all(receipt.get(field)==planned[field] for field in (*IDENTITY,"surface","model","thinking")),"OMP preflight identity/runtime joins")
    runtime=spec()["runtime"]; require(receipt.get("schema_id")=="pm.r10.storage_pipeline.omp_preflight.v2" and all(receipt.get(field)==runtime[field] for field in ("binary","binary_bytes")) and receipt.get("binary_sha256")==runtime["binary_sha256"] and receipt.get("version_stdout")==runtime["version"],"OMP preflight binary/version")
    require(receipt.get("version_command")=={"argv":[runtime["binary"],"--version"],"exit_code":0,"stdout":runtime["version"]},"OMP preflight version command")
    commands=receipt.get("config_commands"); expected=runtime["effective_config"]; require(isinstance(commands,list) and len(commands)==len(expected),"OMP preflight config command roster")
    observed={}
    for command in commands:
        key=command.get("key"); require(command.get("exit_code")==0 and isinstance(command.get("stdout"),str) and key in expected and key not in observed and command.get("argv")==[runtime["binary"],"config","get",key],"OMP preflight exact config command")
        raw=command["stdout"]; observed[key]=P.strict_loads(raw) if raw in {"true","false"} or raw.startswith(("{","[",'"')) else raw
    require(observed==expected and receipt.get("effective_config")==expected and receipt.get("subject_calls")==0,"OMP row-bound effective config")
    verify_popen_state(receipt,launch,planned)
    return digest
def formal_chain() -> dict[str,Any]:
    names=("reservation.json","omp_preflight.json","launch.json","submission_acceptance.json","session.raw.jsonl","request_response_projection.json","structural_projection.json","normalized_projection.json"); records={name:file_record(row_dir()/name,row_dir()) for name in names}; dependency=DB.verify(); projection=records["request_response_projection.json"]; preflight=P.load_json(row_dir()/"omp_preflight.json"); return {"schema_id":"pm.r10.storage_pipeline.semantic_omp_formal_chain.v14","ordered_paths":list(names),"records":records,"final_omp_preflight_sha256":records["omp_preflight.json"]["sha256"],"popen_state_receipt_sha256":preflight["popen_state_receipt_sha256"],"sqlite_sidecar_records":preflight["popen_state_receipt"]["sqlite_sidecar_records"],"request_response_projection_sha256":projection["sha256"],"dependency_snapshot":dependency,"dependency_snapshot_sha256":P.sha256_bytes((P.canonical_json(dependency)+"\n").encode())}
def atomic_json(path: Path, value: Any) -> None:
    if path.name in {"launch.json", "terminal.json"} and isinstance(value, dict) and G.SNAPSHOT_RECEIPT is not None:
        preflight_path=row_dir()/"omp_preflight.json"; preflight=P.load_json(preflight_path); state=preflight.get("popen_state_receipt"); require(isinstance(state,dict) and preflight.get("popen_state_receipt_sha256")==popen_state_sha256(state),"finalized preflight before launch/terminal"); dependency=DB.verify()
        value=copy.deepcopy(value); value["input_snapshot_commit"]=G.SNAPSHOT_COMMIT; value["input_snapshot_sha256"]=G.snapshot_digest(G.SNAPSHOT_RECEIPT); value["dependency_snapshot"]=dependency; value["dependency_snapshot_sha256"]=P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()); value["request_response_projection_binding"]=G.request_response_binding(); value["final_omp_preflight_sha256"]=P.sha256_file(preflight_path); value["popen_state_receipt_sha256"]=preflight["popen_state_receipt_sha256"]
    if path.name == "terminal.json" and isinstance(value, dict) and value.get("status") == "PASS":
        value=copy.deepcopy(value)
        projection=file_record(row_dir()/"request_response_projection.json",row_dir()); value["request_response_projection"]=projection
        for name in ("request_response_projection.json","structural_projection.json","normalized_projection.json"):
            record=file_record(row_dir()/name,row_dir())
            if record not in value["evidence"]: value["evidence"].append(record)
        value["formal_chain"]=formal_chain()
    G.ORIGINAL_ATOMIC(path, value)
def verify_next_row_in_matrix_context(planned: dict[str, Any]) -> list[dict[str, Any]]:
    identity = tuple(planned.get(key) for key in IDENTITY)
    require(tuple(selected_row().get(key) for key in IDENTITY) == identity, "selected/planned current row identity")
    owned=G.SNAPSHOT_OWNED
    if owned: cleanup_selected_snapshot()
    try: prefix = verify_prefix()
    finally:
        require(tuple(selected_row().get(key) for key in IDENTITY) == identity, "current row selection restored after full prefix")
        if owned:
            G.prepare_input_snapshot(); require(G.SNAPSHOT_OWNED and G.SNAPSHOT_RECEIPT is not None and G.SNAPSHOT_RECEIPT["materialized_root"]==planned["snapshot_dir"],"current snapshot restored after prior prefix")
    journal_path = EVIDENCE / "launch_journal.jsonl"
    journal = P.load_jsonl(journal_path) if journal_path.is_file() and not journal_path.is_symlink() else []
    require(prefix["row_count"] == len(journal) == planned["ordinal"] - 1, "exact inner matrix prefix before reservation")
    return journal
def bindings() -> tuple[tuple[Any, str, Any], ...]:
    return (
        (base, "EVIDENCE", EVIDENCE), (base, "route_map", route_map), (base, "plan_rows", rows), (base, "planned_row", planned_row),
        (base, "verify_next_row", verify_next_row_in_matrix_context), (base, "row_preflight", row_preflight), (base, "verify_composer_transition", composer_transition), (base, "expected_argv", expected_argv),
        (base, "run_row", G.PROMPT_READY_RUN_ROW), (base, "atomic_json", atomic_json), (base, "pipeline", G.PROXY), (base, "subprocess", SPROXY), (base,"HERE",RUNTIME_ROOT),
        (omp_session, "verify_submission_prefix", G.verify_submission_prefix), (omp_session, "verify_session", verify_session),
        (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map), (V, "expected_argv", verify_expected_argv), (V,"verify_omp_preflight",verify_dev_omp_preflight),
        (V, "verify_omp_raw", verify_omp_raw), (V, "pipeline", G.PROXY), (V,"HERE",RUNTIME_ROOT),
        (G, "EVIDENCE", EVIDENCE), (G, "V7",RUNTIME_ROOT), (G, "rows", glm_rows), (G, "row_dir", row_dir), (G, "session_health", session_health), (G, "NORMALIZE", semantic_normalize), (G, "cleanup_owned_snapshot", cleanup_selected_snapshot),
    )
@contextlib.contextmanager
def installed() -> Iterator[None]:
    items = bindings()
    saved = [(module, name, getattr(module, name)) for module, name, _value in items]
    try:
        for module, name, value in items:
            setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(saved):
            setattr(module, name, value)
def cleanup_selected_snapshot() -> None:
    target=Path(selected_row()["snapshot_dir"])
    if G.SNAPSHOT_OWNED and os.path.lexists(target):
        permanent(str(target).startswith("/tmp/pm-r10-storage-v7-snapshot-fallback-v14-"),"diagnostic snapshot cleanup scope"); G.remove_private_tree(target)
    G.SNAPSHOT_OWNED=False; G.SNAPSHOT_RECEIPT=None
@contextlib.contextmanager
def active_row(row: dict[str, Any]) -> Iterator[None]:
    with selected(row):
        require(not os.path.lexists(row["snapshot_dir"]), "fresh selected snapshot")
        G.prepare_input_snapshot()
        try:
            with G.forbid_live_plan_reads(): yield
        finally:
            cleanup_selected_snapshot()
            require(not os.path.lexists(row["snapshot_dir"]), "selected snapshot cleanup")
def verify_omp_snapshot_fields(directory:Path,receipt:dict[str,Any])->None:
    snapshot=G.verify_input_snapshot(); digest=G.snapshot_digest(snapshot); launch=P.load_json(directory/"launch.json"); terminal=P.load_json(directory/"terminal.json")
    require(receipt.get("input_snapshot")==snapshot and receipt.get("input_snapshot_sha256")==digest,"OMP preflight snapshot join"); require(all(item.get("input_snapshot_commit")==G.SNAPSHOT_COMMIT and item.get("input_snapshot_sha256")==digest for item in (launch,terminal)),"OMP launch/terminal snapshot join")
    dependency=DB.verify(); dependency_digest=P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()); require(receipt.get("dependency_snapshot")==dependency and receipt.get("dependency_snapshot_sha256")==dependency_digest and all(item.get("dependency_snapshot")==dependency and item.get("dependency_snapshot_sha256")==dependency_digest for item in (launch,terminal)),"OMP dependency snapshot joins")
    preflight_sha=P.sha256_file(directory/"omp_preflight.json"); state_sha=receipt.get("popen_state_receipt_sha256"); require(all(item.get("final_omp_preflight_sha256")==preflight_sha and item.get("popen_state_receipt_sha256")==state_sha for item in (launch,terminal)),"launch/terminal finalized preflight/Popen-state joins")
def verify_omp_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    directory = row_dir(row)
    receipt = P.load_json(directory / "omp_preflight.json")
    adapter = "native_default_semantic_v10"
    require(receipt.get("matrix_contract") == file_record(CONTRACT) and receipt.get("owned_sources") == custody["sources"] and receipt.get("dependency_custody") == custody["dependencies"], "OMP source/dependency receipt")
    require(receipt.get("git_custody") == custody and receipt.get("protocol_adapter") == adapter and receipt.get("row_time_budget_seconds") == 3600, "OMP custody/adapter")
    controls={"goal.continuationModes":[],"recap.enabled":False}; require(receipt.get("config_overlay")==controls and "--config" not in receipt.get("expected_argv", []) and "--no-extensions" in receipt.get("expected_argv", []), "OMP config/argv")
    isolated=receipt.get("isolated_goal_controls",{}); require(isolated.get("values")==controls and isolated.get("commands")==[{"key":"goal.continuationModes","exit_code":0,"stdout":"[]"},{"key":"recap.enabled","exit_code":0,"stdout":"false"}],"verified no-continuation/no-recap controls")
    seed=receipt.get("profile_seed",{}); expected_seed_keys={"environment_roots","environment_roots_initially_empty","mcp_tool_extension_seed_files","omp_profile","pi_profile","seed_records","seed_roster","source_profile","source_records","config_overlay","config_overlay_utf8_bytes","config_overlay_sha256","models_override"}; require(set(seed)==expected_seed_keys and seed["config_overlay"]==controls and seed["seed_roster"]==["agent.db","config.yml","models.db","models.yml"] and seed["source_profile"]==spec()["runtime"]["source_profile_dir"] and seed["environment_roots"]=={name:row[field] for name,field in G.ENV_PATHS.items()} and seed["environment_roots_initially_empty"] is True and seed["mcp_tool_extension_seed_files"]==0 and seed["omp_profile"]==seed["pi_profile"]=="default" and len(seed["source_records"])==3 and len(seed["seed_records"])==4 and {Path(item["path"]).name for item in seed["source_records"]}=={"agent.db","config.yml","models.db"} and {Path(item["path"]).name for item in seed["seed_records"]}=={"agent.db","config.yml","models.db","models.yml"} and all(set(item)=={"path","mode","bytes","sha256"} and isinstance(item["path"],str) and item["mode"]=="0o600" and type(item["bytes"]) is int and item["bytes"]>=0 and re.fullmatch(r"[0-9a-f]{64}",item["sha256"]) for records in (seed["source_records"],seed["seed_records"]) for item in records),"exact isolated four-file OMP profile seed")
    phase=receipt.get("preflight_profile_state",{}); phase_base=phase.get("immutable_profile_records"); phase_sidecars=phase.get("sqlite_sidecar_records"); record_shape=lambda item:set(item)=={"path","mode","bytes","sha256"} and item["mode"]=="0o600" and type(item["bytes"]) is int and item["bytes"]>=0 and re.fullmatch(r"[0-9a-f]{64}",item["sha256"]); require(set(phase)=={"immutable_profile_records","sqlite_sidecar_records"} and [item["path"] for item in phase_base]==["agent.db","config.yml","models.db","models.yml"] and [item["path"] for item in phase_sidecars] in ([],["agent.db-shm"],["agent.db-wal"],["agent.db-shm","agent.db-wal"]) and all(record_shape(item) for item in (*phase_base,*phase_sidecars)),"closed preflight post-query profile state")
    seed_by_name={Path(item["path"]).name:item for item in seed["seed_records"]}; require(all((item["mode"],item["bytes"],item["sha256"])==(seed_by_name[item["path"]]["mode"],seed_by_name[item["path"]]["bytes"],seed_by_name[item["path"]]["sha256"]) for item in phase_base),"preflight immutable profile state joins immediate seed")
    overlay=b"\ngoal:\n  enabled: true\n  continuationModes: []\nrecap:\n  enabled: false\n"; require((seed["config_overlay_utf8_bytes"],seed["config_overlay_sha256"])==(len(overlay),P.sha256_bytes(overlay)),"exact config overlay bytes"); source_map={Path(item["path"]).name:item for item in seed["source_records"]}; seed_map={Path(item["path"]).name:item for item in seed["seed_records"]}; require(all((source_map[name]["bytes"],source_map[name]["sha256"])==(seed_map[name]["bytes"],seed_map[name]["sha256"]) for name in ("agent.db","models.db")),"unchanged database seeds"); source_config=Path(seed["source_profile"])/"config.yml"; require(source_config.is_file() and not source_config.is_symlink() and P.sha256_file(source_config)==source_map["config.yml"]["sha256"] and seed_map["config.yml"]["bytes"]==source_map["config.yml"]["bytes"]+len(overlay) and seed_map["config.yml"]["sha256"]==P.sha256_bytes(source_config.read_bytes()+overlay)=="73bc64d668fa5cdbb57559d191b14ba009520bb7162f8ee75ebcb9d19f2035ff","exact config seed overlay join"); override=seed["models_override"]; require(override=={"git_commit":"4beba8892ec3fd82a5b83c6ec403b4ebd56e7512","git_blob":"f71494ecbb66cbed545bdfa72bd09de0b65cf971","bytes":144,"sha256":"f1a585a1ec9c1a89f2d7533322bad3b7897117cd5fe3e1899bf6bf1139969a69","mode":"0o600"} and (seed_map["models.yml"]["bytes"],seed_map["models.yml"]["sha256"])==(144,override["sha256"]),"committed exact GLM models override")
    require(receipt.get("catalog_refresh") is None and receipt.get("mimo_catalog_api_gate") is False, "GLM has no MiMo catalog/API gate")
    verify_omp_snapshot_fields(directory,receipt)
    structural=P.load_json(directory/"structural_projection.json"); normalized=P.load_json(directory/"normalized_projection.json"); projection_record=file_record(directory/"request_response_projection.json",directory); binding=G.request_response_binding(); launch=P.load_json(directory/"launch.json"); terminal=P.load_json(directory/"terminal.json"); verify_popen_state(receipt,launch,row,custody)
    require(receipt.get("request_response_projection_binding")==launch.get("request_response_projection_binding")==terminal.get("request_response_projection_binding")==binding,"preflight/launch/terminal request-response binding"); require(terminal.get("request_response_projection")==projection_record and structural.get("request_response_projection")=={"path":"request_response_projection.json","bytes":projection_record["bytes"],"sha256":projection_record["sha256"],"binding_sha256":binding["sha256"]},"terminal/structural durable projection hash")
    require(semantic_normalize(directory/"session.raw.jsonl",structural,oracle_path=V7/"oracle.json",schema_path=V7/"response.schema.json",max_text_block_utf8_bytes=P.load_json(V7/"matrix.json")["max_final_assistant_utf8_bytes"])==normalized,"semantic replay")
    with selected(row): require(P.load_json(directory/"terminal.json").get("formal_chain")==formal_chain(),"generic OMP formal chain")
def verify_prefix() -> dict[str, Any]:
    require(not (EVIDENCE/"HOLD.json").exists(),"matrix HOLD blocks suffix/reinvoke")
    journal_path = EVIDENCE / "launch_journal.jsonl"
    journal = P.load_jsonl(journal_path) if journal_path.is_file() and not journal_path.is_symlink() else []
    frozen, routes = rows(), route_map()
    require(len(journal) <= 1, "diagnostic journal maximum")
    reports: list[dict[str, Any]] = []
    custody = git_custody() if journal else None
    if not journal:
        require(not os.path.lexists(EVIDENCE), "empty prefix evidence absence")
    else:
        with installed():
            for row in frozen[:len(journal)]:
                with active_row(row):
                    report = V.verify_row(row["pass_id"], routes[row["route_id"]])
                    require(report["status"] == "PASS", "fail-stop prior row")
                    require(row["surface"]=="omp_tui","diagnostic OMP surface"); verify_omp_receipt(row,custody)
                    reports.append(report)
            mixed_journal(journal, reports)
            grouped = [{"pass_id":"qualification_01","rows":reports}]
            grouped = [group for group in grouped if group["rows"]]
            verify_diagnostic_launch_journal(grouped)
            V.verify_evidence_tree(grouped)
            V.verify_global_uniqueness(grouped)
    for row in frozen[len(journal):]:
        require(not os.path.lexists(row_dir(row)), "future evidence absent")
        require(not any(os.path.lexists(path) for path in runtime_paths(row)), "future runtime absent")
    complete = len(journal) == 1
    return {"status": "PASS_DIAGNOSTIC_COMPLETE_ZERO_CREDIT" if complete else "PASS_EXACT_PREFIX_ZERO_CREDIT", "row_count": len(journal), "required_rows": 1, "qualification_credit": 0, "subject_calls": 0}
def require_launch_authority(row: dict[str, Any]) -> None:
    authority = verified_authority()
    require(authority["runtime_launch_authorized"] is True and authority["provider_calls_authorized"] is True and authority["exact_ordinal_prefix_fail_stop_required"] is True, "runtime/provider authority not frozen")
    require(row["surface"]=="omp_tui" and authority["codex_app_creation_authorized"] is False,"OMP-only diagnostic authority")
    require(row["attempt_id"] in authority["authorized_attempt_ids"] and len([item for item in rows() if all(item[key] == row[key] for key in (*IDENTITY, "surface", "model", "thinking"))]) == 1, "one exact authorized row")
def next_row(ordinal: int, prefix_count: int) -> dict[str, Any]:
    require(ordinal == prefix_count + 1 == 1, "exact sole diagnostic ordinal")
    return rows()[ordinal - 1]
def cleanup_private_capture(row: dict[str, Any]) -> None:
    path=Path(row["private_capture_dir"]); require(str(path)==f"/tmp/pm-r10-storage-v7-http-fallback-v14-{row['nonce']}","private capture cleanup scope")
    if not os.path.lexists(path): return
    mode=path.lstat().st_mode; require(stat.S_ISDIR(mode) and not path.is_symlink() and (mode&0o777)==0o700,"private capture root custody")
    entries=list(path.iterdir()); require(entries and all(stat.S_ISREG(item.lstat().st_mode) and not item.is_symlink() and (item.lstat().st_mode&0o777)==0o600 and item.lstat().st_nlink==1 for item in entries),"private capture file custody")
    G.remove_private_tree(path); require(not os.path.lexists(path),"private capture cleanup")
ERRORS = (MatrixError, PermanentMatrixError, G.ControllerError, G.PermanentCanaryError, N.NormalizationError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)
COMMANDS = ("lint", "verify-prefix", "run")
def _dispatch(argv:list[str]|None=None)->int:
    global DISPATCH_CUSTODY
    parser=argparse.ArgumentParser(); parser.add_argument("command",choices=COMMANDS); parser.add_argument("ordinal",nargs="?",type=int,choices=(1,)); parser.add_argument("--max-seconds",type=int,default=3600); args=parser.parse_args(argv)
    row=None; claim_before=None; output:dict[str,Any]|None=None; rc=0
    try:
        require((args.command in {"lint","verify-prefix"})==(args.ordinal is None),"ordinal command shape"); static=validate_static(unused=args.command=="lint")
        if args.command=="lint": output={"status":"PASS_ZERO_SUBJECT_LINT",**static}
        elif args.command=="verify-prefix": output=verify_prefix()
        else:
            prefix=verify_prefix(); row=next_row(args.ordinal,prefix["row_count"]); validate_omp_paths(row); require_launch_authority(row); custody=git_custody()
            with installed(),active_row(row): runtime=current_runtime_preflight()
            require(runtime["status"]=="PASS_OMP_RUNTIME_18_0_7" and runtime["subject_calls"]==0 and git_custody()==custody,"current OMP runtime/source custody")
            directory=row_dir(row); claim_before=tuple(os.path.lexists(path) for path in (EVIDENCE,directory.parent,directory))
            with installed(),active_row(row):
                require(args.max_seconds==3600,"frozen diagnostic budget"); DISPATCH_CUSTODY=custody; G.DISPATCH_CUSTODY=custody
                try: terminal=base.run_row(row["pass_id"],row["route_id"],3600)
                finally: DISPATCH_CUSTODY=None; G.DISPATCH_CUSTODY=None
            post=verify_prefix(); require(post["row_count"]==1,"full post-row replay"); output={"status":"PASS_DIAGNOSTIC_ROW_ZERO_CREDIT","terminal":terminal,"prefix":post,"qualification_credit":0}
    except ERRORS as exc:
        claimed=False
        if row is not None:
            with installed(),selected(row):
                claimed=claim_after_failure(row,claim_before)
                if claimed:
                    terminal_path=row_dir(row)/"terminal.json"
                    if terminal_path.is_file() and P.load_json(terminal_path).get("status")=="PASS": write_hold(row,exc); output={"status":"HOLD_POST_PASS_CONTROLLER_FAULT","error":f"{type(exc).__name__}: {exc}","qualification_credit":0}; rc=1
                    else:
                        preservation_error=None
                        try: G.preserve_failure(row)
                        except Exception as failure: preservation_error=failure
                        finally:
                            recorded=exc if preservation_error is None else PermanentMatrixError(f"{type(exc).__name__}: {exc}; failure preservation error: {type(preservation_error).__name__}: {preservation_error}")
                            base.record_failure(row["pass_id"],row["route_id"],recorded)
                        output={"status":"FAIL_CONSUMED_STOP_SUFFIX","error":f"{type(recorded).__name__}: {recorded}","qualification_credit":0}; rc=1
        if not claimed: output={"status":"FAIL_PRELAUNCH_NO_MUTATION","error":f"{type(exc).__name__}: {exc}","qualification_credit":0}; rc=1
    finally:
        DISPATCH_CUSTODY=None; G.DISPATCH_CUSTODY=None
        if row is not None:
            try: cleanup_private_capture(row)
            except ERRORS as cleanup_error:
                terminal_path=row_dir(row)/"terminal.json"
                if terminal_path.is_file() and P.load_json(terminal_path).get("status")=="PASS": write_hold(row,cleanup_error); output={"status":"HOLD_POST_PASS_CONTROLLER_FAULT","error":f"{type(cleanup_error).__name__}: {cleanup_error}","qualification_credit":0}; rc=1
                elif rc==0: output={"status":"FAIL_CONSUMED_STOP_SUFFIX","error":f"{type(cleanup_error).__name__}: {cleanup_error}","qualification_credit":0}; rc=1
    try:
        require(DB.verify()==DEPENDENCY_RECEIPT,"dependency snapshot before final stdout")
        if row is not None and rc==0 and (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS": require(git_custody()==P.load_json(row_dir(row)/"omp_preflight.json")["git_custody"],"custody before final stdout")
        print(P.canonical_json(output))
    except Exception as exc:
        if row is not None and (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS": write_hold(row,exc)
        return 1
    return rc
def dispatch(argv: list[str] | None = None) -> int:
    try:
        with G.forbid_live_plan_reads(): return _dispatch(argv)
    finally: DB.cleanup()
if __name__ == "__main__":
    raise SystemExit(dispatch())
