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
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
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
SOURCES = ("README.md", "matrix_contract.json", "controller.py", "local_runtime.py", "local_runtime_selftest.py", "prompt.txt", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
MIMO_ROUTE = "omp_mimo_v25_free_high"
ENV_FIELDS = ("home_dir","xdg_config_home","xdg_cache_home","xdg_data_home","claude_config_dir","copilot_home")
OMP_PATH_STEMS = {
    "cwd": "cwd", "session_dir": "session", "profile_dir": "profile", "home_dir": "home",
    "xdg_config_home": "xdg-config", "xdg_cache_home": "xdg-cache", "xdg_data_home": "xdg-data",
    "claude_config_dir": "claude-config", "copilot_home": "copilot-home", "snapshot_dir": "snapshot",
}
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
    dependencies = [git_file(record["path"]) for record in spec()["dependencies"]]
    require([{key: item[key] for key in ("path", "bytes", "sha256")} for item in dependencies] == spec()["dependencies"], "dependency custody")
    return {"candidate_commit": values[0], "head": values[0], "origin_main": values[1], "truenas_backup_main": values[2], "sources": owned, "dependencies": dependencies}
G=LR.LocalRuntime(repo=REPO,here=HERE,v7=V7,prompt=PROMPT,evidence=EVIDENCE,spec=spec,rows=rows,row_dir=row_dir,git_custody=git_custody,normalizer=LR.normalize_verified_session,error_type=MatrixError,permanent_error_type=PermanentMatrixError,cleanup_prefix="/tmp/pm-r10-storage-v7-snapshot-diagnostic-v8-",route_id=MIMO_ROUTE,visible_selection="⬢ MiMo V2.5 Free · ◒ high".encode())
def runtime_paths(row: dict[str, Any]) -> list[str]:
    fields = ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS)
    return [row[field] for field in fields if row.get(field)]
def validate_omp_paths(row: dict[str, Any]) -> dict[str, str]:
    require(row.get("surface") == "omp_tui" and re.fullmatch(r"[0-9a-f]{32}", str(row.get("nonce"))) is not None, "OMP path identity")
    nonce = row["nonce"]
    expected = {field: (f"/tmp/pm-r10-storage-v7-diagnostic-v8-cwd-{nonce}" if field == "cwd" else f"/tmp/pm-r10-storage-v7-{stem}-diagnostic-v8-{nonce}") for field, stem in OMP_PATH_STEMS.items()}
    require(all(row.get(field) == value for field, value in expected.items()), "exact diagnostic V8 OMP paths")
    require("private_capture_dir" not in row, "no private HTTP path")
    require(row["cwd"].startswith("/tmp/pm-r10-storage-v7-") and row["session_dir"].startswith("/tmp/pm-r10-storage-v7-session-"), "imported runner cwd/session prefixes")
    require(runtime_paths(row) == [row[field] for field in ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS) if field in expected], "exact runtime path roster")
    return expected
def historical_identity_clean(frozen: list[dict[str, Any]]) -> None:
    needles = []
    for row in frozen:
        needles.extend(str(row[field]).encode() for field in ("attempt_id", "nonce", "cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS, "projectless_directory_name", "title") if row.get(field))
    require(len(needles) == len(set(needles)), "globally unique planned identities")
    for path in R10.rglob("*.json"):
        if HERE in path.parents:
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
def verified_authority() -> dict[str, Any]:
    authority, frozen = spec()["authority"], rows()
    require(authority["schema_id"]=="pm.r10.storage_pipeline.active_user_diagnostic_authority.v1" and authority["authority_source"]=="active_user_direction_2026-08-28_v8", "current diagnostic authority")
    require(authority["authorized_attempt_ids"]==[frozen[0]["attempt_id"]] and authority["authorized_row_count"]==authority["authorized_call_count"]==1 and (authority["authorized_route"],authority["authorized_model"],authority["authorized_thinking"])==(frozen[0]["route_id"],frozen[0]["model"],frozen[0]["thinking"]), "one exact authorized diagnostic")
    require(authority["runtime_launch_authorized"] is authority["provider_calls_authorized"] is authority["exact_ordinal_prefix_fail_stop_required"] is True and authority["codex_app_creation_authorized"] is False and authority["qualification_credit"]==0, "diagnostic runtime authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized","live_plans_or_ledgers_authorized","windows_interaction_authorized","worknodes_authorized")), "authority ceiling")
    verify_pinned_canary()
    return authority
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
    require(len(grouped)==1 and grouped[0].get("pass_id")=="diagnostic_01" and len(grouped[0].get("rows",[]))==1,"one diagnostic journal report")
    report=grouped[0]["rows"][0]; journal_path=EVIDENCE/"launch_journal.jsonl"; require(journal_path.is_file() and not journal_path.is_symlink(),"diagnostic journal absent"); journal=P.load_jsonl(journal_path); require(len(journal)==1,"diagnostic journal exact length"); actual=journal[0]; planned=rows()[0]
    keys={"schema_id",*IDENTITY,"started_at_utc","launch_sha256","omp_preflight_sha256","popen_observed","pid"}; require(set(actual)==keys and actual["schema_id"]=="pm.r10.storage_pipeline.launch_journal.v2","diagnostic journal exact schema")
    require(actual["pass_id"]==planned["pass_id"]=="diagnostic_01" and all(actual[key]==planned[key]==report[key] for key in ("ordinal","route_id","attempt_id","nonce")) and actual["launch_sha256"]==report["launch_sha256"] and actual["omp_preflight_sha256"]==report["omp_preflight_sha256"] and actual["popen_observed"] is True and type(actual["pid"]) is int and actual["pid"]>0 and actual["pid"]==report["pid"],"diagnostic journal identity/hash/Popen joins")
    directory=row_dir(planned); reservation=P.load_json(directory/"reservation.json"); launch=P.load_json(directory/"launch.json"); terminal=P.load_json(directory/"terminal.json"); require(actual["started_at_utc"]==launch["started_at_utc"]==report["started_at_utc"] and V.parse_utc(reservation["reserved_at_utc"])<=V.parse_utc(actual["started_at_utc"])<=V.parse_utc(terminal["finished_at_utc"]),"diagnostic journal chronology")
def current_runtime_preflight() -> dict[str,Any]:
    runtime=spec()["runtime"]
    expected_config={"advisor.enabled":False,"autolearn.enabled":False,"goal.continuationModes":["interactive"],"goal.enabled":True,"mcp.enableProjectConfig":False,"memory.backend":"off","plan.defaultOnStartup":False,"task.agentAdvisor":{"task":"off"},"tools.approvalMode":"yolo"}
    require(runtime.get("effective_config")==expected_config,"exact nine-field runtime config contract")
    receipt=G.current_runtime_preflight()
    require(set(receipt)=={"status","binary","binary_bytes","binary_sha256","binary_mode","version","profiles","effective_config","commands","subject_calls"},"runtime preflight receipt schema")
    require(receipt["status"]=="PASS_OMP_RUNTIME_18_0_7" and receipt["subject_calls"]==0 and {key:receipt[key] for key in ("binary","binary_bytes","binary_sha256","binary_mode","version")}=={key:runtime[key] for key in ("binary","binary_bytes","binary_sha256","binary_mode","version")},"runtime preflight binary identity")
    require(receipt["profiles"]=={"OMP_PROFILE":"default","PI_PROFILE":"default"} and receipt["effective_config"]==expected_config and len(receipt["commands"])==9 and [item.get("key") for item in receipt["commands"]]==list(expected_config),"runtime preflight exact effective config")
    return receipt
def write_hold(row: dict[str,Any],exc: BaseException) -> dict[str,Any]:
    hold={"schema_id":"pm.r10.storage_pipeline.diagnostic_hold.v8","ordinal":row["ordinal"],"error":f"{type(exc).__name__}: {exc}","captured_at_utc":base.utc_now(),"suffix_blocked":True,"pass_terminal_immutable":True,"qualification_credit":0}; path=EVIDENCE/"HOLD.json"
    if path.exists(): require(P.load_json(path)==hold or P.load_json(path).get("suffix_blocked") is True,"immutable HOLD")
    else: P.atomic_write(path,P.pretty_json(hold))
    return hold
def expected_prompt() -> str:
    frozen=(V7/"prompts/omp.prompt.txt").read_text(); prefix=frozen.rsplit("\n\n",1)[0]+"\n\n"
    semantic="Decide the final pre-WorkNode disposition from the receipts. Preserve structural success and blockers separately. Use no ordinary tools. Include at least one line-start PM_RESULT marker followed by a JSON object satisfying schema pm.r10.storage_pipeline.subject_result.v1. Use exactly the schema fields and copy their values from the same-named admitted facts. JSON whitespace, object-key order, surrounding explanation, and marker location are benign; do not emit conflicting PM_RESULT candidates.\n\n"
    mandatory='For this bounded task, the admitted receipts are the complete authoritative evidence and are sufficient for the required decision; do not access files. Native Goal completion is mandatory: after deciding the result, call the provided goal tool exactly once with {"op":"complete"} and do not retry it. Include the required PM_RESULT candidate in assistant text, and do not leave the Goal active.\n'
    return prefix+semantic+mandatory
def validate_static(*, unused: bool = True) -> dict[str, Any]:
    contract, frozen, routes = spec(), rows(), list(route_map().values()); planned=frozen[0]
    normalization=contract["normalization"]; require(contract["schema_id"]=="pm.r10.storage_pipeline.mimo_goal_completion_diagnostic.v8" and contract["status"]=="FROZEN_PRELAUNCH_ZERO_CREDIT" and normalization["source"]=="storage_mimo_goal_completion_diagnostic_v8/controller.py" and normalization["function"]=="semantic_normalize" and normalization["source_sha256"]==P.sha256_file(HERE/"controller.py") and normalization["benign"]==["object_key_order","json_whitespace","surrounding_prose","candidate_location"] and normalization["strict"]==["schema","types","values","list_order","duplicate_keys","nonfinite","malformed","conflicts","zero_candidates"],"V8 contract/normalizer custody")
    actual={path.name for path in HERE.iterdir()}; require(actual==set(SOURCES) if unused else actual in (set(SOURCES),set(SOURCES)|{"evidence"}),"root roster")
    metrics={name:metric(HERE/name) for name in SOURCES}; limits=contract["architecture_limits"]; require(metrics["controller.py"]["lines"]<=limits["controller_max_lines"] and metrics["local_runtime.py"]["lines"]<=limits["local_runtime_max_lines"] and metrics["local_runtime_selftest.py"]["lines"]<=limits["local_runtime_selftest_max_lines"] and metrics["selftest.py"]["lines"]<=limits["selftest_max_lines"] and sum(x["lines"] for x in metrics.values())<=limits["package_max_lines"] and sum(x["bytes"] for x in metrics.values())<=limits["package_max_bytes"],"architecture limits")
    require(routes==[{"id":"omp_mimo_v25_free_high","model":"opencode-zen/mimo-v2.5-free","surface":"omp_tui","thinking":"high"}] and contract["route_order"]==[MIMO_ROUTE] and planned["ordinal"]==1 and planned["pass_id"]=="diagnostic_01" and planned["route_id"]==MIMO_ROUTE,"one MiMo/free/high row")
    require((PROMPT.stat().st_size,P.sha256_file(PROMPT))==(planned["prompt_utf8_bytes"],planned["prompt_sha256"])==(3286,"58a3842778a3bc8b720b1ef86ecef134c3cae66173dc6bd7f2cc1a98a86f1d3d") and PROMPT.read_text()==expected_prompt(),"exact derived diagnostic prompt")
    delta=contract["prompt_delta"]; require((delta["base_bytes"],delta["base_sha256"],delta["derived_bytes"],delta["derived_sha256"])==(3036,"eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638",3286,planned["prompt_sha256"]) and delta["authorized_delta"]=="replace_only_final_carrier_paragraphs_with_semantic_candidate_and_exact_goal_completion_paragraph","prompt delta custody")
    require(planned["evidence_path"]==f'evidence/{planned["pass_id"]}/{planned["route_id"]}' and planned["retry_count"]==planned["qualification_credit"]==0,"diagnostic row custody"); validate_omp_paths(planned)
    require(len(expected_records("dependencies"))==contract["dependency_count"]==28 and {(REPO/item["path"]).relative_to(V7).as_posix() for item in contract["dependencies"]}=={item["path"] for item in P.load_json(V7/"freeze_manifest.json")["files"]}|{"freeze_manifest.json"},"complete pinned V7 runtime dependency custody"); require(contract["snapshot"]=={"commit":G.SNAPSHOT_COMMIT,"entry_count":6097,"complete_tree_roots":["Plans","scripts"],"live_plans_reads":0,"read_only":True},"pinned snapshot contract")
    v7=contract["v7_runtime_custody"]; tree=run_git("rev-parse",f"HEAD:{V7.relative_to(REPO).as_posix()}"); require(tree.returncode==0 and tree.stdout.strip()==v7["tree_oid"]=="facc375e2335350d557eb9e51ccd0b076bbdba00" and v7=={"tree_oid":v7["tree_oid"],"freeze_manifest_file_count":27,"declared_dependency_count_including_manifest":28,"historical_controller_imports":0,"codex_lane_imports":0},"exact V7 tree/no historical runtime imports")
    runtime_source=(HERE/"local_runtime.py").read_text(); controller_source=(HERE/"controller.py").read_text(); combined=runtime_source+controller_source; import_lines="\n".join(line for line in combined.splitlines() if re.match(r"^\s*(?:from|import)\s",line)); require(all(token not in import_lines for token in ("storage_normalized_matrix_v6","storage_mimo_normalized_canary_v3","storage_native_matrix_v2","storage_mimo_native_canary_v1","codex_app_lane")) and "import"+"lib" not in combined and "_lo"+"ad(" not in combined and "exter"+"nal(" not in combined,"historical controller/Codex imports absent")
    local=contract["local_runtime_custody"]; require(local["source"]==file_record(HERE/"local_runtime.py",HERE) and local["selftest"]==file_record(HERE/"local_runtime_selftest.py",HERE) and local["imports_only_pinned_v7"] is True and local["historical_controller_imports"]==local["subject_calls"]==0,"local runtime/selftest exact custody")
    fork=contract["v6_fork_custody"]; require(fork["commit"]=="7a83f6d2d662d17b52c62e117d79242da1a9dda0" and run_git("merge-base","--is-ancestor",fork["commit"],"HEAD").returncode==0,"V6 fork ancestry"); require(all({key:pinned_record(fork["commit"],record["path"])[0][key] for key in ("path","bytes","sha256")}==record for record in (fork["controller"],fork["contract"],fork["failure_review"])),"V6 fork/failure-review blobs")
    review=pinned_json(fork["commit"],fork["failure_review"]["path"])[1]; evidence=review["evidence_custody"]; require(review["outcome"]["status"]=="FAIL_CONSUMED_STOP_SUFFIX" and review["outcome"]["no_retry"] is True and review["outcome"]["qualification_credit"]==0 and {name:{key:evidence[name][key] for key in ("bytes","sha256")} for name in ("journal","terminal","runner_failure","postfailure_session")}==fork["failure_evidence"],"V6 exact failure terminal/journal/postfailure lineage")
    runtime=contract["runtime"]; require(runtime["native_goal_completion_count"]==1 and runtime["provided_goal_complete_arguments"]=={"op":"complete"} and runtime["retry_count"]==runtime["qualification_credit"]==runtime["suffix_row_count"]==0 and runtime["terminal_control"]=="CTRL_D_ONCE_AFTER_FINAL" and runtime["normal_exit_required"] is True,"exact diagnostic lifecycle")
    config={"advisor.enabled":False,"autolearn.enabled":False,"goal.continuationModes":["interactive"],"goal.enabled":True,"mcp.enableProjectConfig":False,"memory.backend":"off","plan.defaultOnStartup":False,"task.agentAdvisor":{"task":"off"},"tools.approvalMode":"yolo"}; require({key:runtime[key] for key in ("binary","binary_bytes","binary_mode","binary_sha256","version","source_profile_dir","effective_config")}=={"binary":"/home/sittingmongoose/.local/bin/omp","binary_bytes":183686344,"binary_mode":"0o755","binary_sha256":"4e2468ad6974e6a2edea621da82abca8c95ec62a8354630381c353dc08c7769b","version":"omp/18.0.7","source_profile_dir":"/home/sittingmongoose/.omp/pmdev-r10-simple-canary-v1","effective_config":config},"exact OMP 18.0.7 production runtime contract")
    binary=Path(runtime["binary"]); profile=Path(runtime["source_profile_dir"]); require(binary.is_file() and not binary.is_symlink() and stat.S_ISREG(binary.lstat().st_mode) and (binary.stat().st_size,P.sha256_file(binary),oct(binary.stat().st_mode&0o777))==(runtime["binary_bytes"],runtime["binary_sha256"],runtime["binary_mode"]) and profile.is_dir() and not profile.is_symlink(),"current read-only OMP binary/profile identity")
    catalog=contract["catalog_gate"]; expected_model={"provider":"opencode-zen","id":"mimo-v2.5-free","selector":"opencode-zen/mimo-v2.5-free","name":"MiMo V2.5 Free","contextWindow":200000,"maxTokens":32000,"reasoning":True,"thinking":["low","medium","high"],"input":["text","image"],"cost":{"input":0,"output":0,"cacheRead":0,"cacheWrite":0}}; require(catalog=={"schema_id":"pm.r10.storage_pipeline.omp_catalog_gate.v2","argv":[runtime["binary"],"models","refresh","opencode-zen","--json","--no-extensions"],"profile_dir":runtime["source_profile_dir"],"command_timeout_seconds":30,"freshness_to_popen_max_seconds":60,"forced_online":True,"extensions_disabled":True,"stderr_must_be_empty":True,"exact_selector_count":1,"zero_price_required":True,"required_thinking_effort":"high","recognized_thinking_efforts":["low","medium","high"],"expected_assistant_api":"openai-completions","expected_model":expected_model},"exact MiMo free/high catalog/API contract")
    historical_identity_clean(frozen); verified_authority()
    if unused: require(not os.path.lexists(EVIDENCE) and not any(os.path.lexists(path) for path in runtime_paths(planned)),"unused diagnostic")
    return {"status":"PASS_DIAGNOSTIC_V8_PRELAUNCH","rows":1,"subject_calls":0,"qualification_credit":0,"metrics":metrics}
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
            permanent(argv == expected_argv(route, row) and "--config" not in argv and "--no-extensions" in argv, "exact OMP argv")
            permanent(DISPATCH_CUSTODY == git_custody(), "custody before Popen")
            preflight=P.load_json(row_dir(row)/"omp_preflight.json"); snapshot=G.verify_input_snapshot(); permanent(preflight.get("git_custody")==DISPATCH_CUSTODY and preflight.get("input_snapshot")==snapshot and preflight.get("input_snapshot_sha256")==G.snapshot_digest(snapshot),"preflight/Popen custody and snapshot")
            env = G.isolated_env(dict(kwargs["env"]))
            permanent(env["PI_CODING_AGENT_DIR"] == row["profile_dir"] and env["OMP_PROFILE"] == env["PI_PROFILE"] == "default", "isolated profile")
            permanent(not os.path.lexists(Path(row["home_dir"]) / ".cursor"), "host Cursor excluded")
            env.pop("PI_REQ_DEBUG", None)
            kwargs["env"] = env
        return G.ORIGINAL_POPEN(argv, *args, **kwargs)
SPROXY = SubprocessProxy()
def row_preflight(path: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    seed = G.prepare_profile()
    receipt = G.ORIGINAL_PREFLIGHT(path, row, route)
    require(DISPATCH_CUSTODY is not None and git_custody() == DISPATCH_CUSTODY, "custody before preflight")
    require(receipt["effective_config"]["advisor.enabled"] is False and receipt["effective_config"]["task.agentAdvisor"] == {"task": "off"}, "advisor controls off")
    catalog = G.forced_catalog_refresh() if row["route_id"] == MIMO_ROUTE else None
    if catalog is not None: G.validate_catalog_receipt(catalog)
    snapshot=verify_selected_pipeline()
    receipt.update({"matrix_contract": file_record(CONTRACT), "owned_sources": DISPATCH_CUSTODY["sources"], "dependency_custody": DISPATCH_CUSTODY["dependencies"], "git_custody": DISPATCH_CUSTODY, "profile_seed": seed, "protocol_adapter": "native_default_semantic_v8", "config_overlay": None, "catalog_refresh": catalog, "mimo_catalog_api_gate": row["route_id"] == MIMO_ROUTE, "row_time_budget_seconds": 3600, "expected_argv": expected_argv(route, row), "qualification_credit": 0, "input_snapshot": snapshot, "input_snapshot_sha256": G.snapshot_digest(snapshot)})
    G.ORIGINAL_ATOMIC(path / "omp_preflight.json", receipt)
    return receipt
def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
    if selected_row()["route_id"] == MIMO_ROUTE:
        return G.composer_transition(before, after)
    permanent(isinstance(before, bytes) and isinstance(after, bytes) and before and after.startswith(before), "composer snapshot")
    pre, post, delta = base.strip_terminal(before), base.strip_terminal(after), base.strip_terminal(after[len(before):])
    markers = ("📄 #1".encode(), b"/goal Audit", "❯ 📄 #1".encode())
    submitted = row_dir() / "stdin_prompt.raw"
    permanent(submitted.is_file() and not submitted.is_symlink() and submitted.read_bytes() == PROMPT.read_bytes(), "submitted prompt")
    permanent(G.PROMPT_READY in pre and G.MCP_SENTINEL not in pre and G.MCP_SENTINEL not in post and all(marker not in pre for marker in markers), "empty-MCP pre-composer")
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
    return terminal
def semantic_normalize(path: Path, structural: dict[str,Any], *, oracle_path: Path, schema_path: Path, max_text_block_utf8_bytes: int) -> dict[str,Any]:
    oracle=P.load_json(oracle_path); schema=P.load_json(schema_path); canonical=P.RESULT_PREFIX+oracle_path.read_text().strip(); _slot,_header,entries,_raw=omp_session.load_physical_session(path)
    assistants=[(i,e,e["message"]) for i,e in enumerate(entries) if e.get("type")=="message" and isinstance(e.get("message"),dict) and e["message"].get("role")=="assistant"]
    permanent(len(assistants)==structural.get("assistant_message_count") and assistants,"semantic assistant roster")
    def pairs(items:list[tuple[str,Any]])->dict[str,Any]:
        result={}
        for key,value in items:
            if key in result: raise ValueError(f"duplicate key: {key}")
            result[key]=value
        return result
    def nonfinite(value:str)->Any: raise ValueError(f"nonfinite: {value}")
    decoder=json.JSONDecoder(object_pairs_hook=pairs,parse_constant=nonfinite); markers=re.compile(r"(?m)^[ \t]*PM_RESULT(?![A-Za-z0-9_])(?P<separator>[ \t]+)?"); candidates=[]; text_records=[]; total=0
    for assistant_ordinal,(entry_index,entry,message) in enumerate(assistants,1):
        content=message.get("content"); permanent(isinstance(content,list),"assistant content list")
        for block_index,block in enumerate(content):
            if not isinstance(block,dict) or block.get("type")!="text": continue
            text=block.get("text"); permanent(isinstance(text,str) and len(text.encode())<=max_text_block_utf8_bytes,"bounded assistant text"); total+=len(text.encode()); text_records.append({"assistant_ordinal":assistant_ordinal,"entry_index":entry_index,"entry_id":entry.get("id"),"message_id":message.get("id"),"block_index":block_index,"utf8_bytes":len(text.encode()),"sha256":P.sha256_bytes(text.encode())})
            for match in markers.finditer(text):
                permanent(match.group("separator") is not None,"marker separator")
                try: payload_start=match.end()+re.match(r"[ \t\r\n]*",text[match.end():]).end(); value,end=decoder.raw_decode(text,payload_start)
                except Exception as exc: raise PermanentMatrixError(f"invalid PM_RESULT candidate: {type(exc).__name__}: {exc}") from exc
                line_end=text.find("\n",end); line_end=len(text) if line_end<0 else line_end; permanent(not text[end:line_end].strip(" \t\r"),"extra same-line PM_RESULT payload")
                N.validate_schema(value,schema); start=match.start(); raw=text[start:line_end].encode(); candidates.append((value,{"assistant_ordinal":assistant_ordinal,"entry_index":entry_index,"entry_id":entry.get("id"),"message_id":message.get("id"),"block_index":block_index,"line_index":text.count("\n",0,start)+1,"end_line_index":text.count("\n",0,end)+1,"raw_span":text[start:line_end],"raw_span_utf8_bytes":len(raw),"raw_span_sha256":P.sha256_bytes(raw)}))
    permanent(total<=max_text_block_utf8_bytes*len(assistants),"bounded aggregate assistant text"); permanent(candidates,"at least one PM_RESULT candidate"); first=candidates[0][0]; permanent(all(N.typed_equal(first,value) for value,_ in candidates[1:]),"conflicting PM_RESULT candidates"); permanent(N.typed_equal(first,oracle),"PM_RESULT differs from oracle")
    raw_last=structural.get("final_text"); permanent(isinstance(raw_last,str),"raw final text"); projection=dict(structural); projection.update({"raw_last_assistant_text":raw_last,"raw_last_assistant_utf8_bytes":len(raw_last.encode()),"raw_last_assistant_sha256":P.sha256_bytes(raw_last.encode()),"verified_assistant_text_blocks":text_records,"verified_assistant_text_utf8_bytes":total,"result_normalization":{"schema_id":"pm.r10.storage_pipeline.result_normalization.v2","result_authority":"deterministic_matrix_host_program_over_verified_assistant_text","candidate_count":len(candidates),"candidates":[record for _,record in candidates],"canonical_text":canonical,"canonical_utf8_bytes":len(canonical.encode()),"canonical_sha256":P.sha256_bytes(canonical.encode()),"raw_session_preserved":True,"surrounding_prose_authoritative":False,"object_key_order_authoritative":False,"list_order_authoritative":True},"final_text":canonical,"final_text_sha256":P.sha256_bytes(canonical.encode())}); return projection
def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    if selected_row()["route_id"] == MIMO_ROUTE:
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
    return G.verify_omp_raw(path, route, launch, terminal) if route["id"] == MIMO_ROUTE else G.PROMPT_READY_VERIFY_OMP_RAW(path, route, launch, terminal)
def formal_chain() -> dict[str,Any]:
    names=("reservation.json","omp_preflight.json","launch.json","submission_acceptance.json","session.raw.jsonl","structural_projection.json","normalized_projection.json"); records={name:file_record(row_dir()/name,row_dir()) for name in names}; return {"schema_id":"pm.r10.storage_pipeline.semantic_omp_formal_chain.v8","ordered_paths":list(names),"records":records}
def atomic_json(path: Path, value: Any) -> None:
    if path.name in {"launch.json", "terminal.json"} and isinstance(value, dict) and G.SNAPSHOT_RECEIPT is not None:
        value=copy.deepcopy(value); value["input_snapshot_commit"]=G.SNAPSHOT_COMMIT; value["input_snapshot_sha256"]=G.snapshot_digest(G.SNAPSHOT_RECEIPT)
    if path.name == "terminal.json" and isinstance(value, dict) and value.get("status") == "PASS":
        value=copy.deepcopy(value)
        for name in ("structural_projection.json","normalized_projection.json"):
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
        (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map), (V, "expected_argv", verify_expected_argv),
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
        permanent(str(target).startswith("/tmp/pm-r10-storage-v7-snapshot-diagnostic-v8-"),"diagnostic snapshot cleanup scope"); G.remove_private_tree(target)
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
def verify_omp_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    directory = row_dir(row)
    receipt = P.load_json(directory / "omp_preflight.json")
    adapter = "native_default_semantic_v8"
    require(receipt.get("matrix_contract") == file_record(CONTRACT) and receipt.get("owned_sources") == custody["sources"] and receipt.get("dependency_custody") == custody["dependencies"], "OMP source/dependency receipt")
    require(receipt.get("git_custody") == custody and receipt.get("protocol_adapter") == adapter and receipt.get("row_time_budget_seconds") == 3600, "OMP custody/adapter")
    require(receipt.get("config_overlay") is None and "--config" not in receipt.get("expected_argv", []) and "--no-extensions" in receipt.get("expected_argv", []), "OMP config/argv")
    seed=receipt.get("profile_seed",{}); require(set(seed)=={"environment_roots","environment_roots_initially_empty","mcp_tool_extension_seed_files","omp_profile","pi_profile","seed_records","seed_roster","source_profile","source_records"} and seed["seed_roster"]==["agent.db","config.yml","models.db"] and seed["source_profile"]==spec()["runtime"]["source_profile_dir"] and seed["environment_roots"]=={name:row[field] for name,field in G.ENV_PATHS.items()} and seed["environment_roots_initially_empty"] is True and seed["mcp_tool_extension_seed_files"]==0 and seed["omp_profile"]==seed["pi_profile"]=="default" and all(len(records)==3 and {Path(item["path"]).name for item in records}=={"agent.db","config.yml","models.db"} and all(set(item)=={"path","mode","bytes","sha256"} and isinstance(item["path"],str) and item["mode"]=="0o600" and type(item["bytes"]) is int and item["bytes"]>=0 and re.fullmatch(r"[0-9a-f]{64}",item["sha256"]) for item in records) for records in (seed["source_records"],seed["seed_records"])) and {Path(item["path"]).name:(item["bytes"],item["sha256"]) for item in seed["source_records"]}=={Path(item["path"]).name:(item["bytes"],item["sha256"]) for item in seed["seed_records"]} and receipt.get("config_overlay") is None,"exact isolated three-file OMP profile seed")
    if row["route_id"] == MIMO_ROUTE:
        G.validate_catalog_receipt(receipt["catalog_refresh"], P.load_json(directory / "launch.json")["started_at_utc"])
    else:
        require(receipt.get("catalog_refresh") is None and receipt.get("mimo_catalog_api_gate") is False, "non-MiMo has no catalog/API gate")
    verify_omp_snapshot_fields(directory,receipt)
    structural=P.load_json(directory/"structural_projection.json"); normalized=P.load_json(directory/"normalized_projection.json")
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
            grouped = [{"pass_id":"diagnostic_01","rows":reports}]
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
    finally: DISPATCH_CUSTODY=None; G.DISPATCH_CUSTODY=None
    try:
        if row is not None and rc==0 and (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS": require(git_custody()==P.load_json(row_dir(row)/"omp_preflight.json")["git_custody"],"custody before final stdout")
        print(P.canonical_json(output))
    except Exception as exc:
        if row is not None and (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS": write_hold(row,exc)
        return 1
    return rc
def dispatch(argv: list[str] | None = None) -> int:
    with G.forbid_live_plan_reads():
        return _dispatch(argv)
if __name__ == "__main__":
    raise SystemExit(dispatch())
