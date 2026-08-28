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
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator
HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = Path("/mnt/Cursor/PuppetMaster")
import dependency_bootstrap as DB
class DependencyContamination(RuntimeError): pass
def _early_dependency_hold(exc:BaseException)->None:
    evidence=HERE/"evidence"; journal=evidence/"launch_journal.jsonl"
    if not evidence.is_dir() or evidence.is_symlink() or not journal.is_file() or journal.is_symlink(): return
    try:
        entries=[json.loads(line) for line in journal.read_text().splitlines() if line]; last=entries[-1]; directory=evidence/last["pass_id"]/last["route_id"]
        if not directory.is_dir() or directory.is_symlink(): return
        hold=evidence/"HOLD.json"; value={"schema_id":"pm.r10.storage_pipeline.matrix_hold.v1","ordinal":last["ordinal"],"error":f"DependencyContamination: dependency bootstrap contamination: {exc}","captured_at_utc":datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00","Z"),"suffix_blocked":True,"qualification_credit":0}
        if not hold.exists():
            descriptor=os.open(hold,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
            try: os.write(descriptor,(json.dumps(value,sort_keys=True,separators=(",",":"))+"\n").encode()); os.fsync(descriptor)
            finally: os.close(descriptor)
    except Exception: pass
try: DEPENDENCY_RECEIPT = DB.materialize()
except RuntimeError as exc:
    _early_dependency_hold(exc); DB.cleanup(); raise DependencyContamination(f"dependency bootstrap contamination: {exc}") from exc
def dependency_verify()->dict[str,Any]:
    try: return DB.verify()
    except RuntimeError as exc: raise DependencyContamination(f"dependency verify contamination: {exc}") from exc
try: V7 = DB.verified_root()
except RuntimeError as exc:
    _early_dependency_hold(exc); DB.cleanup(); raise DependencyContamination(f"dependency root contamination: {exc}") from exc
PROMPT = HERE / "prompt.txt"
CODEX_PROMPT = HERE / "codex_prompt.txt"
CANARY_AUTHORITY = R10 / "STORAGE_MIMO_NORMALIZED_CANARY_V3_AUTHORITY.json"
CANARY_PUSH_CUSTODY = R10 / "STORAGE_MIMO_NORMALIZED_CANARY_V3_PUSH_CUSTODY.json"
CANARY_SOURCE_COMMIT = "fccf63c813e185c715293005f7f7390d28a850ae"
CANARY_EVIDENCE_COMMIT = "7c017517c48ce678eea580a1639ef16d7d6bd408"
CANARY_CLOSURE_COMMIT = "bd2da304e75d4a551f80f5ddba969f4531f7a385"
sys.path.insert(0, str(V7))
try: import local_runtime as LR
except RuntimeError as exc:
    _early_dependency_hold(exc); DB.cleanup(); raise DependencyContamination(f"dependency module contamination: {exc}") from exc
import codex_app_lane as app
P, V, base, omp_session, freeze_check = LR.P, LR.V, LR.base, LR.omp_session, LR.freeze_check
N = LR
CONTRACT = HERE / "matrix_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "matrix_contract.json", "controller.py", "dependency_bootstrap.py", "local_runtime.py", "codex_app_lane.py", "prompt.txt", "codex_prompt.txt", "v14_pass_lineage.json", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
GLM_ROUTE = "omp_glm53_flash_max"
ENV_FIELDS = tuple(LR.ENV_PATHS.values())
OMP_PATH_STEMS = {
    "cwd": "cwd", "session_dir": "session", "profile_dir": "profile", "home_dir": "home",
    "xdg_config_home": "xdg-config", "xdg_cache_home": "xdg-cache", "xdg_data_home": "xdg-data",
    "claude_config_dir": "claude-config", "copilot_home": "copilot-home", "snapshot_dir": "snapshot",
}
ORIGINAL_CODEX_RAW = V.verify_codex_raw
ORIGINAL_APP_WRITE = app.write_terminal
ORIGINAL_APP_DIRECT = app.verify_direct_evidence
ISSUED = "create_request_issued.json"
CURRENT_ROW: dict[str, Any] | None = None
DISPATCH_CUSTODY: dict[str, Any] | None = None
class MatrixError(RuntimeError): pass
class PermanentMatrixError(RuntimeError): pass
class AlreadyIssuedNoMutation(RuntimeError): pass
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
    require(isinstance(value, list) and len(value) == 24, "24 frozen rows")
    return value
def route_map() -> dict[str, dict[str, Any]]:
    routes = spec().get("routes")
    require(isinstance(routes, list) and len(routes) == 12, "12 routes")
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
    dependency = dependency_verify()
    prefix = "tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/system_pipeline_sandbox_v7/"
    dependencies = [{"path": prefix + item["path"], "bytes": item["bytes"], "sha256": item["sha256"], "git_mode": item["mode"], "git_oid": item["blob"]} for item in dependency["files"]]
    require([{key: item[key] for key in ("path", "bytes", "sha256")} for item in dependencies] == spec()["dependencies"], "bootstrapped dependency custody")
    return {"candidate_commit": values[0], "head": values[0], "origin_main": values[1], "truenas_backup_main": values[2], "sources": owned, "dependencies": dependencies}
G = LR.LocalRuntime(
    repo=REPO, here=HERE, v7=V7, prompt=PROMPT, evidence=EVIDENCE,
    spec=spec, rows=lambda:[selected_row()], row_dir=row_dir, git_custody=git_custody,
    normalizer=None, error_type=MatrixError, permanent_error_type=PermanentMatrixError,
    cleanup_prefix="/tmp/pm-r10-storage-v15-snapshot-", route_id=GLM_ROUTE,
)
def runtime_paths(row: dict[str, Any]) -> list[str]:
    fields = ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS)
    return [row[field] for field in fields if row.get(field)]
def validate_omp_paths(row: dict[str, Any]) -> dict[str, str]:
    require(row.get("surface") == "omp_tui" and re.fullmatch(r"[0-9a-f]{32}", str(row.get("nonce"))) is not None, "OMP path identity")
    nonce = row["nonce"]
    expected = {field: f"/tmp/pm-r10-storage-v15-{stem}-{nonce}" for field, stem in OMP_PATH_STEMS.items()}
    require(all(row.get(field) == value for field, value in expected.items()), "exact normalized matrix V6 OMP paths")
    if row["route_id"] == GLM_ROUTE:
        require(row.get("private_capture_dir") == f"/tmp/pm-r10-storage-v15-http-{nonce}", "exact GLM private capture path")
    else:
        require("private_capture_dir" not in row, "private HTTP path GLM-only")
    require(row["cwd"].startswith("/tmp/pm-r10-storage-v15-cwd-") and row["session_dir"].startswith("/tmp/pm-r10-storage-v15-session-"), "V15 runner cwd/session prefixes")
    require(runtime_paths(row) == [row[field] for field in ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS) if field in expected], "exact runtime path roster")
    return expected
def historical_identity_clean(frozen: list[dict[str, Any]]) -> None:
    needles = []
    for row in frozen:
        needles.extend(str(row[field]).encode() for field in ("attempt_id", "nonce", "cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS, "projectless_directory_name", "title") if row.get(field))
    require(len(needles) == len(set(needles)), "globally unique planned identities")
    command=["grep","-n","-F"]
    for needle in needles: command.extend(["-e",needle.decode()])
    command.extend(["HEAD","--",R10.relative_to(REPO).as_posix()])
    result=run_git(*command); require(result.returncode in {0,1},"historical identity Git-object scan")
    own=HERE.relative_to(REPO).as_posix()+"/"
    require(all(line.split(":",1)[0].startswith(own) for line in result.stdout.splitlines()),"historical identity reuse")
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
def verify_lineage()->dict[str,Any]:
    lineage=P.load_json(HERE/"v14_pass_lineage.json"); frozen=spec()["v14_pass_lineage"]
    parents,tree=commit_shape(lineage["source_commit"]); require(tree==lineage["source_tree_oid"]==frozen["source_tree_oid"] and run_git("merge-base","--is-ancestor",lineage["source_commit"],"HEAD").returncode==0,"V14 committed ancestry/tree")
    package=run_git("rev-parse",f'{lineage["source_commit"]}:tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/storage_glm53_max_fallback_qualification_v14'); require(package.returncode==0 and package.stdout.strip()==lineage["package_source_tree_oid"],"V14 package tree")
    require({key:lineage[key] for key in frozen}==frozen and lineage["status"]=="PASS" and lineage["qualification_credit"]==0 and lineage["no_retry"] is True,"V14 PASS lineage")
    fallback=spec()["mimo_dev11_fallback_lineage"]; require(fallback=={"attempt_id":"storage-mimo-dev-dev11-e34fff7f6b","provider_error_status":429,"provider_error_type":"FreeUsageLimitError","status":"FAIL_CONSUMED_ZERO_CREDIT","qualification_credit":0,"no_retry":True,"fallback_route":GLM_ROUTE},"MiMo dev11 fallback lineage")
    return {"status":"PASS_V14_LINEAGE_AND_MIMO_429_FALLBACK","subject_calls":0,"qualification_credit":0}
def verified_authority() -> dict[str, Any]:
    authority, frozen = spec()["authority"], rows()
    require(authority["authority_source"] == "active_user_direction_2026-08-28_storage_normalized_matrix_v15", "current V15 authority")
    require(authority["authorized_attempt_ids"] == [row["attempt_id"] for row in frozen] and authority["authorized_row_count"] == authority["authorized_call_count"] == 24, "exact authorized attempts")
    require(authority["runtime_launch_authorized"] is authority["provider_calls_authorized"] is authority["codex_app_creation_authorized"] is True, "matrix runtime authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized","live_plans_or_ledgers_authorized","windows_interaction_authorized","worknodes_authorized")), "authority ceiling")
    return authority
class AppEvidencePath(type(Path())):
    def iterdir(self) -> Iterator[Path]:
        return (path for path in super().iterdir() if path.name != ISSUED)
def verify_issued(directory: Path, row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    path = directory / ISSUED; require(path.is_file() and not path.is_symlink(), "immutable create issuance marker")
    value, request = P.load_json(path), app.create_request(row, CODEX_PROMPT.read_text()); raw = (P.canonical_json(request) + "\n").encode()
    require(set(value) == {"schema_id", *IDENTITY, "issued_at_utc", "request", "request_utf8_bytes", "request_sha256", "git_custody"} and value["schema_id"] == "pm.r10.storage_pipeline.codex_create_request_issued.v1", "issuance marker shape")
    require(all(value[key] == row[key] for key in IDENTITY) and value["request"] == request and (value["request_utf8_bytes"], value["request_sha256"]) == (len(raw), P.sha256_bytes(raw)) and value["git_custody"] == custody, "issuance marker joins")
    launch = P.load_json(directory / "launch.json"); record = file_record(path, directory)
    require(launch.get("create_request_issued") == record and launch.get("git_custody") == custody and V.parse_utc(launch["started_at_utc"]) <= V.parse_utc(value["issued_at_utc"]), "issuance launch/time join")
    return {"record": record, "request": request, "value": value}
def atomic_issue(path: Path, raw: bytes) -> None:
    if os.path.lexists(path): raise AlreadyIssuedNoMutation("ALREADY_ISSUED_NO_MUTATION")
    temporary = path.with_name(f".{ISSUED}.{os.getpid()}.{id(raw)}.tmp"); require(not os.path.lexists(temporary), "fresh issuance temporary")
    P.atomic_write(temporary, raw)
    try:
        try: os.link(temporary, path, follow_symlinks=False)
        except FileExistsError as exc: raise AlreadyIssuedNoMutation("ALREADY_ISSUED_NO_MUTATION") from exc
    finally:
        if os.path.lexists(temporary): os.unlink(temporary)
def issue_create(directory: Path, row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    path = directory / ISSUED
    require(git_custody() == custody, "custody at create issuance"); request = app.create_request(row, CODEX_PROMPT.read_text()); raw = (P.canonical_json(request) + "\n").encode()
    value = {"schema_id": "pm.r10.storage_pipeline.codex_create_request_issued.v1", **{key: row[key] for key in IDENTITY}, "issued_at_utc": base.utc_now(), "request": request, "request_utf8_bytes": len(raw), "request_sha256": P.sha256_bytes(raw), "git_custody": custody}
    atomic_issue(path, P.pretty_json(value)); launch = P.load_json(directory / "launch.json"); require("create_request_issued" not in launch, "one launch issuance join")
    launch["create_request_issued"] = file_record(path, directory); P.atomic_write(directory / "launch.json", P.pretty_json(launch)); verify_issued(directory, row, custody)
    return request
def emittable_create(directory: Path, row: dict[str, Any], custody: dict[str, Any]) -> str:
    closed = (directory / "terminal.json", directory / "runner_failure.json")
    if any(os.path.lexists(path) for path in closed): raise AlreadyIssuedNoMutation("ALREADY_TERMINAL_NO_MUTATION")
    issued = verify_issued(directory, row, custody); payload = P.canonical_json(issued["request"]) + "\n"
    if any(os.path.lexists(path) for path in closed): raise AlreadyIssuedNoMutation("ALREADY_TERMINAL_NO_MUTATION")
    return payload
def app_append_journal(row: dict[str, Any], directory: Path) -> None:
    append_app_journal(row, directory); journal = P.load_jsonl(EVIDENCE / "launch_journal.jsonl"); issued = verify_issued(directory, row, P.load_json(directory / "launch.json")["git_custody"])
    journal[-1]["create_request_issued"] = issued["record"]; P.atomic_write(EVIDENCE / "launch_journal.jsonl", P.jsonl_bytes(journal))
def verify_issued_journal(journal: list[dict[str, Any]], row: dict[str, Any], issued: dict[str, Any]) -> None:
    require(len(journal) >= row["ordinal"] and journal[row["ordinal"] - 1].get("create_request_issued") == issued["record"], "issuance journal join")
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
def exact_reservation(row: dict[str, Any]) -> bool:
    path=row_dir(row)/"reservation.json"
    if not row_claimed(row) or not path.is_file() or path.is_symlink(): return False
    try: value=P.load_json(path)
    except Exception: return False
    return value.get("schema_id")=="pm.r10.storage_pipeline.reservation.v2" and all(value.get(k)==row[k] for k in IDENTITY)
def app_created(d: Path,row: dict[str,Any]) -> dict[str,Any]:
    request=P.load_json(d/"create_request.json"); receipt=app.canonical_receipt((d/"create_receipt.raw.json").read_bytes(),P,"create_thread",request); require("result" in receipt,"create success"); return app._create_result(receipt["result"],row)
def app_waits(d: Path,create: dict[str,Any]) -> list[dict[str,Any]]:
    result=[]; previous=None; paths=sorted(d.glob("wait_[0-9][0-9][0-9].raw.json")); require(len(paths)<=spec()["runtime"]["codex_wait_max_receipts"],"wait count")
    for path in paths:
        request=app.wait_request(create,result,spec()["runtime"]["codex_wait_timeout_ms"]); receipt=app.canonical_receipt(path.read_bytes(),P,"wait_threads",request); require("result" in receipt,"wait success"); state=app.wait_state(receipt["result"],create)
        if previous is not None: require(state["revision"]>=previous["revision"],"wait revision")
        previous=state; result.append(receipt)
    return result
def app_budget(d: Path) -> None:
    launch=P.load_json(d/"launch.json"); elapsed=(V.parse_utc(base.utc_now())-V.parse_utc(launch["started_at_utc"])).total_seconds(); require(0<=elapsed<=3600,"App budget")
def verify_selected_pipeline() -> dict[str,Any]:
    receipt=G.verify_input_snapshot(); report=G.PROXY.verify(); require(report.get("status")=="PASS_VERIFIED_NO_WORKNODES","full frozen pre-WorkNode pipeline"); require(receipt==G.SNAPSHOT_RECEIPT and receipt["live_plans_open_or_read_count"]==0,"App snapshot pipeline receipt"); return receipt
def append_app_journal(row: dict[str,Any],d: Path) -> None:
    journal=base.journal_rows(); require(len(journal)==row["ordinal"]-1,"App journal prefix"); launch=P.load_json(d/"launch.json")
    entry={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{k:row[k] for k in IDENTITY},"started_at_utc":launch["started_at_utc"],"launch_sha256":P.sha256_file(d/"launch.json"),"omp_preflight_sha256":None,"app_create_observed":True,"pid":None}
    P.atomic_write(EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes([*journal,entry]))
def reserve_app(d: Path,row: dict[str,Any],custody: dict[str,Any]) -> dict[str,Any]:
    snapshot=verify_selected_pipeline(); launch=app.reserve(d,row,CODEX_PROMPT.read_text(),P,base.utc_now); digest=G.snapshot_digest(snapshot); dependency=dependency_verify(); launch.update({"matrix_contract":file_record(CONTRACT),"owned_sources":custody["sources"],"dependency_custody":custody["dependencies"],"dependency_snapshot":dependency,"dependency_snapshot_sha256":P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()),"git_custody":custody,"protocol_adapter":"codex_app_host_receipt_semantic_v15","parent_allowed_calls":["create_thread","wait_threads","read_thread"],"input_snapshot":snapshot,"input_snapshot_sha256":digest,"row_time_budget_seconds":3600,"qualification_credit":0}); P.atomic_write(d/"launch.json",P.pretty_json(launch)); return launch
def verify_app_launch(row: dict[str,Any],custody: dict[str,Any]) -> dict[str,Any]:
    snapshot=verify_selected_pipeline(); launch=P.load_json(row_dir(row)/"launch.json"); dependency=dependency_verify(); require(launch["matrix_contract"]==file_record(CONTRACT) and launch["git_custody"]==custody and launch["dependency_custody"]==custody["dependencies"] and launch.get("dependency_snapshot")==dependency,"App custody"); require(launch["protocol_adapter"]=="codex_app_host_receipt_semantic_v15" and launch["parent_allowed_calls"]==["create_thread","wait_threads","read_thread"],"App lane"); require(launch["input_snapshot"]==snapshot and launch["input_snapshot_sha256"]==G.snapshot_digest(snapshot),"App pipeline/snapshot join"); return launch
def mixed_journal(journal: list[dict[str,Any]],reports: list[dict[str,Any]]) -> None:
    require(len(journal)==len(reports),"journal length")
    prior=None
    for report,actual in zip(reports,journal,strict=True):
        frozen=rows()[report["ordinal"]-1]; directory=row_dir(frozen); launch=P.load_json(directory/"launch.json")
        base_keys={"schema_id",*IDENTITY,"started_at_utc","launch_sha256","omp_preflight_sha256","pid"}; expected=base_keys|({"popen_observed"} if frozen["surface"]=="omp_tui" else {"app_create_observed","create_request_issued"})
        require(set(actual)==expected and actual["schema_id"]=="pm.r10.storage_pipeline.launch_journal.v2" and all(actual.get(k)==frozen[k] for k in IDENTITY),"exact mixed journal schema/identity")
        require(actual["started_at_utc"]==launch["started_at_utc"]==report["started_at_utc"] and actual["launch_sha256"]==P.sha256_file(directory/"launch.json")==report["launch_sha256"],"journal launch/time joins")
        if frozen["surface"]=="omp_tui": require(actual["popen_observed"] is True and type(actual["pid"]) is int and actual["pid"]>0 and actual["pid"]==launch.get("pid")==report.get("pid") and actual["omp_preflight_sha256"]==P.sha256_file(directory/"omp_preflight.json")==report["omp_preflight_sha256"],"OMP journal Popen/PID/preflight")
        else: require(actual["app_create_observed"] is True and actual["pid"] is None and actual["omp_preflight_sha256"] is None and actual["create_request_issued"]==file_record(directory/ISSUED,directory),"App journal create/issuance")
        current=V.parse_utc(actual["started_at_utc"]); require(prior is None or prior<current,"strict launch chronology"); prior=current
def build_row_report(row:dict[str,Any],entry:dict[str,Any],terminal:dict[str,Any],verified:dict[str,Any]|None=None)->dict[str,Any]:
    directory=row_dir(row); launch=P.load_json(directory/"launch.json"); require(all(terminal.get(key)==row[key] for key in IDENTITY) and terminal.get("surface")==row["surface"] and terminal.get("model")==row["model"] and terminal.get("thinking")==row["thinking"],"terminal row joins"); require(V.parse_utc(launch["started_at_utc"])<=V.parse_utc(terminal["finished_at_utc"]),"launch/terminal chronology")
    preflight_sha=P.sha256_file(directory/"omp_preflight.json") if row["surface"]=="omp_tui" else None
    if row["surface"]=="omp_tui" and terminal.get("evidence"):
        records={record.get("path"):record for record in terminal["evidence"] if isinstance(record,dict)}; require(records.get("omp_preflight.json")==file_record(directory/"omp_preflight.json",directory),"terminal self-reports actual preflight")
    raw=directory/("session.raw.jsonl" if row["surface"]=="omp_tui" else "rollout.raw.jsonl"); structural=P.load_json(directory/"structural_projection.json") if (directory/"structural_projection.json").is_file() else {}
    if terminal["status"]=="PASS":
        require(isinstance(verified,dict) and verified.get("status")=="PASS","PASS requires verified row report"); observed=verified.get("observed_identity"); raw_sha=verified.get("raw_primary_sha256"); pid=verified.get("pid")
        require(isinstance(observed,str) and bool(observed) and isinstance(raw_sha,str) and bool(re.fullmatch(r"[0-9a-f]{64}",raw_sha)),"verified PASS identity/raw hash")
        require(raw.is_file() and not raw.is_symlink() and raw_sha==P.sha256_file(raw),"verified PASS raw custody")
        if row["surface"]=="omp_tui": require(type(pid) is int and pid>0 and pid==launch.get("pid"),"verified PASS OMP PID")
        else: require(pid is None and launch.get("pid") is None,"verified PASS App PID")
    else: observed=terminal.get("observed_identity"); raw_sha=P.sha256_file(raw) if raw.is_file() and not raw.is_symlink() else None; pid=launch.get("pid")
    return {"status":terminal["status"],"ordinal":row["ordinal"],"pass_id":row["pass_id"],"route_id":row["route_id"],"attempt_id":row["attempt_id"],"nonce":row["nonce"],"surface":row["surface"],"started_at_utc":launch["started_at_utc"],"finished_at_utc":terminal["finished_at_utc"],"launch_sha256":P.sha256_file(directory/"launch.json"),"omp_preflight_sha256":preflight_sha,"pid":pid,"cwd":row.get("cwd"),"session_dir":row.get("session_dir"),"projectless_directory_name":row.get("projectless_directory_name"),"observed_identity":observed,"goal_id":structural.get("goal_id"),"raw_sha256":raw_sha,"qualification_credit":0}
def verify_global_outcomes(reports:list[dict[str,Any]])->None:
    for report in reports:
        if report.get("status")=="PASS": require(isinstance(report.get("observed_identity"),str) and bool(report["observed_identity"]) and isinstance(report.get("raw_sha256"),str) and bool(re.fullmatch(r"[0-9a-f]{64}",report["raw_sha256"])),"every PASS has verified identity/raw hash")
    for field in ("attempt_id","nonce","cwd","session_dir","projectless_directory_name","observed_identity","goal_id","raw_sha256"):
        values=[report[field] for report in reports if report.get(field) is not None]; require(len(values)==len(set(values)),f"global uniqueness: {field}")
def fail_app(row: dict[str,Any],exc: BaseException) -> bool:
    d=row_dir(row)
    if not row_claimed(row): return False
    if (d/"terminal.json").exists():
        if P.load_json(d/"terminal.json").get("status")=="PASS": write_hold(row,exc); return True
        return False
    events=P.load_jsonl(d/"host_events.jsonl") if (d/"host_events.jsonl").is_file() else []; created=bool(events and events[0].get("tool")=="create_thread")
    failure={"schema_id":"pm.r10.storage_pipeline.runner_failure.v2",**{k:row[k] for k in IDENTITY},"error":f"{type(exc).__name__}: {exc}","app_create_observed":created,"captured_at_utc":base.utc_now(),"qualification_credit":0,"no_retry":True}; P.atomic_write(d/"runner_failure.json",P.pretty_json(failure)); ORIGINAL_APP_WRITE(d,row,route_map()[row["route_id"]],P,status="FAIL",failure="APP_RECEIPT_OR_EVIDENCE_FAILURE",external_submissions=int(created)); return False
def write_hold(row: dict[str,Any],exc: BaseException) -> dict[str,Any]:
    hold={"schema_id":"pm.r10.storage_pipeline.matrix_hold.v1","ordinal":row["ordinal"],"error":f"{type(exc).__name__}: {exc}","captured_at_utc":base.utc_now(),"suffix_blocked":True,"qualification_credit":0}; path=EVIDENCE/"HOLD.json"
    if path.exists(): require(P.load_json(path)==hold or P.load_json(path).get("suffix_blocked") is True,"immutable HOLD")
    else: P.atomic_write(path,P.pretty_json(hold))
    return hold
def global_contamination(exc:BaseException)->bool:
    if isinstance(exc,DependencyContamination): return True
    text=f"{type(exc).__name__}: {exc}".lower(); return any(token in text for token in ("custody","dependency snapshot","authority","source drift","snapshot drift","evidence root","evidence roster","matrix hold"))
def capture_host_receipt(d: Path,path: Path,raw: bytes,tool: str,request: dict[str,Any]) -> dict[str,Any]:
    require(not path.exists(),f"one {tool} receipt"); P.atomic_write(path,raw); receipt=app.canonical_receipt(raw,P,tool,request); app.append_host_event(d,tool,request,path,P); return receipt
def finish_app(d: Path,row: dict[str,Any],create: dict[str,Any],prompt: str) -> dict[str,Any]:
    raw_rows=P.load_jsonl(d/"rollout.raw.jsonl"); finals=[]
    for item in raw_rows:
        payload=item.get("payload")
        if item.get("type")=="response_item" and isinstance(payload,dict) and payload.get("type")=="message" and payload.get("role")=="assistant" and payload.get("phase")=="final_answer": finals.append(V.text_blocks(payload.get("content")))
    require(len(finals)==1,"one raw final"); projection=verify_codex_candidate(d,row,create,prompt,finals[0])
    # Candidate PASS is built and independently verified in a private mirror; real terminal remains absent.
    with tempfile.TemporaryDirectory(prefix="pm-r10-v6-app-candidate-") as temporary:
        mirror=Path(temporary)/"evidence"; shutil.copytree(EVIDENCE,mirror); candidate=mirror/row["pass_id"]/row["route_id"]
        terminal=app_write_terminal(candidate,row,route_map()[row["route_id"]],P,status="PASS",final=finals[0],identity=projection["session_id"])
        old_evidence=V.EVIDENCE
        try:
            V.EVIDENCE=mirror
            app_verify_direct(candidate,row,prompt,spec(),P,V,P.load_json(candidate/"launch.json"),terminal)
            report=V.verify_row(row["pass_id"],route_map()[row["route_id"]]); require(report["status"]=="PASS","candidate App row")
        finally: V.EVIDENCE=old_evidence
        require(not (d/"terminal.json").exists(),"no preverified real PASS"); P.atomic_write(d/"terminal.json",(candidate/"terminal.json").read_bytes())
    app_verify_direct(d,row,prompt,spec(),P,V,P.load_json(d/"launch.json"),P.load_json(d/"terminal.json"))
    return {"status":"PASS_CODEX_ROW_ZERO_CREDIT","terminal":P.load_json(d/"terminal.json"),"qualification_credit":0}
def ingest(row: dict[str,Any],stage: str,raw: bytes) -> dict[str,Any]:
    d=row_dir(row); require(exact_reservation(row) and not (d/"terminal.json").exists(),"open App reservation"); app_budget(d); prompt=CODEX_PROMPT.read_text(); create_request=app.create_request(row,prompt)
    if stage=="create":
        receipt=capture_host_receipt(d,d/"create_receipt.raw.json",raw,"create_thread",create_request); app_append_journal(row,d); require("result" in receipt,"create error"); return {"status":"PASS_CREATE_CAPTURED_CONSUMED",**app._create_result(receipt["result"],row),"qualification_credit":0}
    create=app_created(d,row); prior=app_waits(d,create)
    if stage=="wait":
        require(len(prior)<spec()["runtime"]["codex_wait_max_receipts"] and (not prior or not app.validate_wait(prior[-1]["result"],create)),"wait open"); request=app.wait_request(create,prior,spec()["runtime"]["codex_wait_timeout_ms"]); receipt=capture_host_receipt(d,d/f"wait_{len(prior)+1:03d}.raw.json",raw,"wait_threads",request); require("result" in receipt,"wait error"); return {"status":"PASS_WAIT_TERMINAL_READY" if app.validate_wait(receipt["result"],create) else "PASS_WAIT_PENDING","wait_count":len(prior)+1,"qualification_credit":0}
    require(prior and app.validate_wait(prior[-1]["result"],create),"completed wait before read")
    if stage=="read":
        receipt=capture_host_receipt(d,d/"read_receipt.raw.json",raw,"read_thread",app.read_request(create,spec())); require("result" in receipt,"read error"); request=app.raw_request(row,create); P.atomic_write(d/"raw_copy_request.json",P.pretty_json(request)); return {"status":"PASS_READ_CAPTURED_AWAIT_RAW_COPY_1","raw_copy_request":request,"qualification_credit":0}
    require(stage in {"raw1","raw2"} and (d/"read_receipt.raw.json").is_file(),"raw after read"); request=app.raw_request(row,create); require(P.load_json(d/"raw_copy_request.json")==request,"raw request join"); ordinal=1 if stage=="raw1" else 2; path=d/f"raw_copy_{ordinal}.receipt.json"; require(not path.exists(),"one raw copy"); P.atomic_write(path,raw); receipt,content=app.raw_copy_receipt(raw,P,request,ordinal)
    if ordinal==1: P.atomic_write(d/"rollout.read1.jsonl",content); return {"status":"PASS_RAW_COPY_1_CAPTURED_AWAIT_COPY_2","qualification_credit":0}
    first_receipt,first=app.raw_copy_receipt((d/"raw_copy_1.receipt.json").read_bytes(),P,request,1); require(first==content and all(first_receipt["source"][k]==receipt["source"][k] for k in ("hostId","path","bytes","sha256")),"stable raw copies"); require(V.parse_utc(first_receipt["source"]["observedAtUtc"])<V.parse_utc(receipt["source"]["observedAtUtc"]),"ordered raw copies"); P.atomic_write(d/"rollout.read2.jsonl",content); P.atomic_write(d/"rollout.raw.jsonl",content); return finish_app(d,row,create,prompt)
def validate_static(*, unused: bool = True) -> dict[str, Any]:
    contract, frozen, routes = spec(), rows(), list(route_map().values())
    normalization=contract["normalization"]
    require(contract["schema_id"] == "pm.r10.storage_normalized_matrix.v15" and contract["status"] == "MUTABLE_PRELAUNCH_ZERO_CREDIT", "V15 contract identity")
    require(normalization["source"]=="storage_normalized_matrix_v15/controller.py" and normalization["function"]=="semantic_normalize" and normalization["source_sha256"]==P.sha256_file(HERE/"controller.py"), "V15 normalizer custody")
    actual = {path.name for path in HERE.iterdir()}; require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES)|{"evidence"}), "root roster")
    metrics = {name:metric(HERE/name) for name in SOURCES}; limits=contract["architecture_limits"]
    require(metrics["controller.py"]["lines"]<=limits["controller_max_lines"] and metrics["selftest.py"]["lines"]<=limits["selftest_max_lines"] and sum(x["lines"] for x in metrics.values())<=limits["package_max_lines"] and sum(x["bytes"] for x in metrics.values())<=limits["package_max_bytes"], "architecture limits")
    require([route["id"] for route in routes] == contract["route_order"] and [row["route_id"] for row in frozen[:12]] == contract["route_order"] == [row["route_id"] for row in frozen[12:]], "route order twice")
    expected_routes=[("omp_glm53_flash_max","omp_tui","opencode-go/glm-5.3-flash","max"),("omp_cursor_default_auto","omp_tui","cursor/default","auto"),("omp_muse_spark_xhigh","omp_tui","opencode-go/muse-spark-1.2-contributor","xhigh"),("omp_deepseek_v4_flash_max","omp_tui","opencode-go/deepseek-v4-flash","max"),("omp_gemini_37_flash_high","omp_tui","google-antigravity/gemini-3.7-flash","high"),("codex_luna_max","codex_app","gpt-5.6-luna","max"),("codex_luna_medium","codex_app","gpt-5.6-luna","medium"),("codex_gpt54_xhigh","codex_app","gpt-5.4","xhigh"),("codex_gpt54_medium","codex_app","gpt-5.4","medium"),("codex_gpt54mini_xhigh","codex_app","gpt-5.4-mini","xhigh"),("codex_gpt54mini_medium","codex_app","gpt-5.4-mini","medium"),("omp_qwen38_max_xhigh","omp_tui","alibaba-token-plan/qwen3.8-max","xhigh")]
    require([(route["id"],route["surface"],route["model"],route["thinking"]) for route in routes]==expected_routes,"exact 12 route selectors/efforts")
    require([row["ordinal"] for row in frozen] == list(range(1,25)) and len({row["attempt_id"] for row in frozen}) == len({row["nonce"] for row in frozen}) == 24, "24 fresh identities")
    prompt=PROMPT; require((prompt.stat().st_size,P.sha256_file(prompt))==(4006,"316a5af878ac5cda474505801f8089e44b27db18169185f195082844b3ef9616"), "qualified V14 OMP prompt")
    codex_prompt=CODEX_PROMPT; require((codex_prompt.stat().st_size,P.sha256_file(codex_prompt))==(4190,"3b46fff91df4b73819d7504557e17b81f51ecf032ca4921bf90f08f68afff26e"),"bounded Codex Goal prompt")
    for row in frozen:
        expected_prompt=(4006,"316a5af878ac5cda474505801f8089e44b27db18169185f195082844b3ef9616") if row["surface"]=="omp_tui" else (4190,"3b46fff91df4b73819d7504557e17b81f51ecf032ca4921bf90f08f68afff26e")
        require(row["evidence_path"] == f'evidence/{row["pass_id"]}/{row["route_id"]}' and (row["prompt_utf8_bytes"],row["prompt_sha256"])==expected_prompt, "row prompt/evidence")
        if row["surface"]=="omp_tui":
            validate_omp_paths(row); require((row.get("profile_override")=="glm53_exact_models_yml" and "private_capture_dir" in row)==(row["route_id"]==GLM_ROUTE),"GLM-only profile/private capture")
        else: require("profile_override" not in row and "private_capture_dir" not in row,"Codex has no OMP profile/private capture")
    dependency=dependency_verify(); prefix="tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/system_pipeline_sandbox_v7/"
    require([{"path":prefix+item["path"],"bytes":item["bytes"],"sha256":item["sha256"]} for item in dependency["files"]]==contract["dependencies"] and dependency["file_count"]==contract["dependency_count"]==28,"exact bootstrapped dependencies")
    require(contract["snapshot"]["commit"] == G.SNAPSHOT_COMMIT and contract["snapshot"]["entry_count"] == 6097, "V3 snapshot")
    require(CODEX_PROMPT.read_text().startswith("Create a goal that"), "Codex Goal prompt")
    historical_identity_clean(frozen); verified_authority(); verify_lineage()
    if unused:
        require(not os.path.lexists(EVIDENCE), "evidence absent")
        require(not any(os.path.lexists(path) for row in frozen for path in runtime_paths(row)), "runtime absent")
    return {"status":"PASS_LOCAL_MATRIX_V15_PRELAUNCH", "rows":24, "subject_calls":0, "qualification_credit":0, "metrics":metrics}
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
def profile_phase_records(row:dict[str,Any],seed:dict[str,Any])->tuple[list[dict[str,Any]],list[dict[str,Any]]]:
    profile=Path(row["profile_dir"]); base_names=set(seed["seed_roster"]); allowed=base_names|{"agent.db-shm","agent.db-wal"}; entries=sorted(profile.iterdir(),key=lambda item:item.name); require(base_names<={item.name for item in entries}<=allowed,"closed post-seed profile roster")
    records=[]
    for item in entries:
        require(item.is_file() and not item.is_symlink() and stat.S_ISREG(item.lstat().st_mode) and (item.stat().st_mode&0o777)==0o600,"safe profile file"); records.append({"path":item.name,"mode":"0o600","bytes":item.stat().st_size,"sha256":P.sha256_file(item)})
    current={item["path"]:item for item in records}; seeded={Path(item["path"]).name:item for item in seed["seed_records"]}; require(all((current[name]["bytes"],current[name]["sha256"])==(seeded[name]["bytes"],seeded[name]["sha256"]) for name in base_names),"immutable profile seeds")
    return [current[name] for name in seed["seed_roster"]],[current[name] for name in ("agent.db-shm","agent.db-wal") if name in current]
def finalize_popen_state(row:dict[str,Any],route:dict[str,Any],argv:list[str])->dict[str,Any]:
    path=row_dir(row)/"omp_preflight.json"; preflight=P.load_json(path); require("popen_state_receipt" not in preflight,"fresh Popen-state")
    runtime=spec()["runtime"]; binary=Path(runtime["binary"]); binary_record={"path":str(binary),"bytes":binary.stat().st_size,"sha256":P.sha256_file(binary),"mode":oct(binary.stat().st_mode&0o777)}; require(binary_record=={"path":runtime["binary"],"bytes":runtime["binary_bytes"],"sha256":runtime["binary_sha256"],"mode":runtime["binary_mode"]},"Popen binary")
    env=G.isolated_env(dict(os.environ)); version=G.ORIGINAL_RUN([str(binary),"--version"],check=False,capture_output=True,text=True,env=env,timeout=30); require(version.returncode==0 and version.stderr=="" and version.stdout.strip()==runtime["version"],"Popen version")
    observed={}; commands=[]
    for key,expected in runtime["effective_config"].items():
        process=G.ORIGINAL_RUN([str(binary),"config","get",key],check=False,capture_output=True,text=True,env=env,timeout=30); raw=process.stdout.strip(); value=P.strict_loads(raw) if raw in {"true","false"} or raw.startswith(("{","[",'"')) else raw; require(process.returncode==0 and process.stderr=="" and value==expected,"Popen effective config"); observed[key]=value; commands.append({"key":key,"stdout":raw,"exit_code":0})
    immutable,sidecars=profile_phase_records(row,preflight["profile_seed"]); dependency=dependency_verify(); snapshot=G.verify_input_snapshot(); custody=git_custody(); require(custody==DISPATCH_CUSTODY==preflight["git_custody"] and snapshot==preflight["input_snapshot"] and dependency==preflight["dependency_snapshot"] and argv==expected_argv(route,row),"Popen closed custody")
    state={"schema_id":"pm.r10.storage_pipeline.popen_state_receipt.v15","observed_at_utc":base.utc_now(),"binary":binary_record,"version":runtime["version"],"immutable_profile_records":immutable,"sqlite_sidecar_records":sidecars,"effective_config":observed,"config_commands":commands,"argv":argv,"source_custody":custody,"dependency_snapshot_sha256":P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()),"input_snapshot_sha256":G.snapshot_digest(snapshot),"subject_popen_count_before":0}
    final=copy.deepcopy(preflight); final["popen_state_receipt"]=state; final["popen_state_receipt_sha256"]=P.sha256_bytes((P.canonical_json(state)+"\n").encode()); P.atomic_write(path,P.pretty_json(final)); return final
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
            permanent(Path(kwargs.get("cwd","")).resolve()==V7.resolve() and dependency_verify()==DEPENDENCY_RECEIPT,"exact runtime root/dependency before Popen")
            permanent(argv == expected_argv(route, row) and "--config" not in argv and "--no-extensions" in argv, "exact OMP argv")
            permanent(DISPATCH_CUSTODY == git_custody(), "custody before Popen")
            preflight=P.load_json(row_dir(row)/"omp_preflight.json"); snapshot=G.verify_input_snapshot(); permanent(preflight.get("git_custody")==DISPATCH_CUSTODY and preflight.get("input_snapshot")==snapshot and preflight.get("dependency_snapshot")==DEPENDENCY_RECEIPT,"preflight/Popen custody")
            env = G.isolated_env(dict(kwargs["env"]))
            permanent(env["PI_CODING_AGENT_DIR"] == row["profile_dir"] and env["OMP_PROFILE"] == env["PI_PROFILE"] == "default", "isolated profile")
            permanent(not os.path.lexists(Path(row["home_dir"]) / ".cursor"), "host Cursor excluded")
            if row["route_id"] == GLM_ROUTE:
                env["PI_REQ_DEBUG"] = "1"
            else:
                env.pop("PI_REQ_DEBUG", None)
            kwargs["env"] = env
            finalize_popen_state(row,route,argv)
        return G.ORIGINAL_POPEN(argv, *args, **kwargs)
SPROXY = SubprocessProxy()
def row_preflight(path: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    seed = G.prepare_profile()
    receipt = G.ORIGINAL_PREFLIGHT(path, row, route)
    require(DISPATCH_CUSTODY is not None and git_custody() == DISPATCH_CUSTODY, "custody before preflight")
    require(receipt["effective_config"]["advisor.enabled"] is False and receipt["effective_config"]["task.agentAdvisor"] == {"task": "off"}, "advisor controls off")
    catalog = None
    controls={"goal.continuationModes":[],"recap.enabled":False}
    immutable,sidecars=profile_phase_records(row,seed); dependency=dependency_verify(); receipt.update({"matrix_contract": file_record(CONTRACT), "owned_sources": DISPATCH_CUSTODY["sources"], "dependency_custody": DISPATCH_CUSTODY["dependencies"], "dependency_snapshot":dependency,"dependency_snapshot_sha256":P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()), "git_custody": DISPATCH_CUSTODY, "profile_seed": seed,"preflight_profile_state":{"immutable_profile_records":immutable,"sqlite_sidecar_records":sidecars}, "protocol_adapter": "native_default_semantic_v15", "config_overlay": seed["config_overlay"], "catalog_refresh": catalog, "mimo_catalog_api_gate": False, "isolated_goal_controls":{"values":controls}, "row_time_budget_seconds": 3600, "expected_argv": expected_argv(route, row), "qualification_credit": 0, "input_snapshot": G.verify_input_snapshot(), "input_snapshot_sha256": G.snapshot_digest(G.verify_input_snapshot())})
    G.ORIGINAL_ATOMIC(path / "omp_preflight.json", receipt)
    return receipt
def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
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
def enforce_no_continuation_or_recap(path:Path,structural:dict[str,Any])->None:
    _slot,_header,entries,_raw=omp_session.load_physical_session(path); recap=sum(1 for entry in entries if "recap" in str(entry.get("type","")).lower() or "recap" in str(entry.get("customType","")).lower())
    permanent(structural.get("native_continuation_count")==0,"native continuation forbidden by frozen config")
    permanent(recap==0,"recap forbidden by frozen config")
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
    decoder=json.JSONDecoder(object_pairs_hook=pairs,parse_constant=nonfinite); markers=re.compile(r"(?m)^[ \t]*PM_RESULT(?![A-Za-z0-9_])"); candidates=[]; text_records=[]; total=0
    for assistant_ordinal,(entry_index,entry,message) in enumerate(assistants,1):
        content=message.get("content"); permanent(isinstance(content,list),"assistant content list")
        for block_index,block in enumerate(content):
            if not isinstance(block,dict) or block.get("type")!="text": continue
            text=block.get("text"); permanent(isinstance(text,str) and len(text.encode())<=max_text_block_utf8_bytes,"bounded assistant text"); total+=len(text.encode()); text_records.append({"assistant_ordinal":assistant_ordinal,"entry_index":entry_index,"entry_id":entry.get("id"),"message_id":message.get("id"),"block_index":block_index,"utf8_bytes":len(text.encode()),"sha256":P.sha256_bytes(text.encode())})
            for match in markers.finditer(text):
                separator=re.match(r"[ \t\r\n]{1,64}",text[match.end():]); permanent(separator is not None and (len(separator.group())==64 or not text[match.end()+len(separator.group()):].startswith(tuple(" \t\r\n"))),"marker separator bounds 1..64")
                try: payload_start=match.end()+len(separator.group()); value,end=decoder.raw_decode(text,payload_start)
                except Exception as exc: raise PermanentMatrixError(f"invalid PM_RESULT candidate: {type(exc).__name__}: {exc}") from exc
                line_end=text.find("\n",end); line_end=len(text) if line_end<0 else line_end; permanent(not text[end:line_end].strip(" \t\r"),"extra same-line PM_RESULT payload")
                N.validate_schema(value,schema); start=match.start(); raw=text[start:line_end].encode(); candidates.append((value,{"assistant_ordinal":assistant_ordinal,"entry_index":entry_index,"entry_id":entry.get("id"),"message_id":message.get("id"),"block_index":block_index,"line_index":text.count("\n",0,start)+1,"end_line_index":text.count("\n",0,end)+1,"raw_span":text[start:line_end],"raw_span_utf8_bytes":len(raw),"raw_span_sha256":P.sha256_bytes(raw)}))
    permanent(total<=max_text_block_utf8_bytes*len(assistants),"bounded aggregate assistant text"); permanent(candidates,"at least one PM_RESULT candidate"); first=candidates[0][0]; permanent(all(N.typed_equal(first,value) for value,_ in candidates[1:]),"conflicting PM_RESULT candidates"); permanent(N.typed_equal(first,oracle),"PM_RESULT differs from oracle")
    raw_last=structural.get("final_text"); permanent(isinstance(raw_last,str),"raw final text"); projection=dict(structural); projection.update({"raw_last_assistant_text":raw_last,"raw_last_assistant_utf8_bytes":len(raw_last.encode()),"raw_last_assistant_sha256":P.sha256_bytes(raw_last.encode()),"verified_assistant_text_blocks":text_records,"verified_assistant_text_utf8_bytes":total,"result_normalization":{"schema_id":"pm.r10.storage_pipeline.result_normalization.v2","result_authority":"deterministic_matrix_host_program_over_verified_assistant_text","candidate_count":len(candidates),"candidates":[record for _,record in candidates],"canonical_text":canonical,"canonical_utf8_bytes":len(canonical.encode()),"canonical_sha256":P.sha256_bytes(canonical.encode()),"raw_session_preserved":True,"surrounding_prose_authoritative":False,"object_key_order_authoritative":False,"list_order_authoritative":True},"final_text":canonical,"final_text_sha256":P.sha256_bytes(canonical.encode())}); return projection
def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    if selected_row()["route_id"] == GLM_ROUTE:
        structural=G.verify_session(path, **expected); enforce_no_continuation_or_recap(path,structural); return structural
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
    enforce_no_continuation_or_recap(path,structural)
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
    return G.verify_omp_raw(path, route, launch, terminal) if route["id"] == GLM_ROUTE else G.PROMPT_READY_VERIFY_OMP_RAW(path, route, launch, terminal)
def formal_chain() -> dict[str,Any]:
    names=["reservation.json","omp_preflight.json","launch.json","submission_acceptance.json","session.raw.jsonl"]+(["request_response_projection.json"] if selected_row()["route_id"]==GLM_ROUTE else [])+["structural_projection.json","normalized_projection.json"]; records={name:file_record(row_dir()/name,row_dir()) for name in names}; dependency=dependency_verify(); return {"schema_id":"pm.r10.storage_pipeline.semantic_omp_formal_chain.v15","ordered_paths":names,"records":records,"dependency_snapshot":dependency,"dependency_snapshot_sha256":P.sha256_bytes((P.canonical_json(dependency)+"\n").encode())}
def atomic_json(path: Path, value: Any) -> None:
    if path.name in {"launch.json", "terminal.json"} and isinstance(value, dict) and G.SNAPSHOT_RECEIPT is not None:
        dependency=dependency_verify(); preflight_path=row_dir()/"omp_preflight.json"; preflight=P.load_json(preflight_path); require(isinstance(preflight.get("popen_state_receipt"),dict) and isinstance(preflight.get("popen_state_receipt_sha256"),str),"finalized preflight before launch/terminal"); value=copy.deepcopy(value); value["input_snapshot_commit"]=G.SNAPSHOT_COMMIT; value["input_snapshot_sha256"]=G.snapshot_digest(G.SNAPSHOT_RECEIPT); value["dependency_snapshot"]=dependency; value["dependency_snapshot_sha256"]=P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()); value["final_omp_preflight_sha256"]=P.sha256_file(preflight_path); value["popen_state_receipt_sha256"]=preflight["popen_state_receipt_sha256"]
    if path.name == "terminal.json" and isinstance(value, dict) and value.get("status") == "PASS":
        value=copy.deepcopy(value)
        for name in ("structural_projection.json","normalized_projection.json"):
            record=file_record(row_dir()/name,row_dir())
            if record not in value["evidence"]: value["evidence"].append(record)
        value["formal_chain"]=formal_chain()
    G.ORIGINAL_ATOMIC(path, value)
def normalize_codex(path: Path, raw_final: str) -> dict[str, Any]:
    raw_rows = P.load_jsonl(path)
    assistants = []
    finals = []
    response_indices = []
    complete_call_ids = []
    create_call_ids = []
    inspection_call_ids = []
    call_styles=[]
    call_style_by_id={}
    output_indices = {}
    output_values = {}
    objectives = {}
    task_started=[(i,item["payload"]) for i,item in enumerate(raw_rows) if item.get("type")=="event_msg" and isinstance(item.get("payload"),dict) and item["payload"].get("type")=="task_started"]
    task_complete=[(i,item["payload"]) for i,item in enumerate(raw_rows) if item.get("type")=="event_msg" and isinstance(item.get("payload"),dict) and item["payload"].get("type")=="task_complete"]
    contexts=[(i,item["payload"]) for i,item in enumerate(raw_rows) if item.get("type")=="turn_context" and isinstance(item.get("payload"),dict)]
    require(len(task_started)==len(task_complete)==len(contexts)==1,"exact Codex task lifecycle")
    turn_id=task_started[0][1].get("turn_id"); require(isinstance(turn_id,str) and turn_id and task_complete[0][1].get("turn_id")==contexts[0][1].get("turn_id")==turn_id,"Codex turn identity")
    planned=selected_row(); context=contexts[0][1]; settings=context.get("collaboration_mode",{}).get("settings",{}); require(context.get("model")==planned["model"] and context.get("effort")==planned["thinking"] and settings.get("model")==planned["model"] and settings.get("reasoning_effort")==planned["thinking"],"Codex top-level/nested turn model/effort")
    for index, item in enumerate(raw_rows):
        payload = item.get("payload")
        if item.get("type") != "response_item" or not isinstance(payload, dict):
            continue
        response_indices.append(index)
        if payload.get("type") == "message" and payload.get("role") == "assistant":
            content = payload.get("content")
            require(isinstance(content, list) and content, "Codex assistant content")
            blocks = []
            for block in content:
                require(isinstance(block, dict) and block.get("type") in {"output_text", "text"} and isinstance(block.get("text"), str), "Codex assistant text block")
                blocks.append({"type": "text", "text": block["text"]})
            record = (index, payload, blocks)
            assistants.append(record)
            if payload.get("phase") == "final_answer":
                finals.append(record)
        elif payload.get("type") == "custom_tool_call" and payload.get("name") == "exec" and isinstance(payload.get("input"), str):
            source=payload["input"]; inspection=re.fullmatch(r'\s*const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*await\s+tools\.get_goal\(\s*\{\s*\}\s*\)\s*;\s*text\(\s*\1\s*\)\s*;?\s*',source,re.DOTALL)
            if inspection: kind,_objective="get_goal",None
            else: kind, _objective = V.parse_goal_wrapper(source)
            call_id=payload.get("call_id"); require(isinstance(call_id,str) and call_id and call_id not in call_style_by_id,"unique Codex call_id"); call_style_by_id[call_id]="wrapper"; call_styles.append("wrapper"); target=create_call_ids if kind=="create_goal" else complete_call_ids if kind=="update_goal" else inspection_call_ids; target.append(call_id); objectives[call_id]=_objective
        elif payload.get("type") == "function_call" and payload.get("name") in {"create_goal","update_goal","get_goal"}:
            arguments=payload.get("arguments"); arguments=P.strict_loads(arguments) if isinstance(arguments,str) else arguments
            require(isinstance(arguments,dict) and ((payload["name"]=="create_goal" and set(arguments)=={"objective"} and isinstance(arguments["objective"],str) and arguments["objective"].strip()) or (payload["name"]=="update_goal" and arguments=={"status":"complete"}) or (payload["name"]=="get_goal" and arguments=={})),"direct Codex Goal arguments")
            call_id=payload.get("call_id"); require(isinstance(call_id,str) and call_id and call_id not in call_style_by_id,"unique Codex call_id"); call_style_by_id[call_id]="direct"; call_styles.append("direct"); target=create_call_ids if payload["name"]=="create_goal" else complete_call_ids if payload["name"]=="update_goal" else inspection_call_ids; target.append(call_id); objectives[call_id]=arguments.get("objective")
        elif payload.get("type") in {"custom_tool_call_output","function_call_output"}:
            call_id=payload.get("call_id"); require(isinstance(call_id,str) and call_id in call_style_by_id and call_id not in output_indices,"known unique Codex output call_id"); require((payload["type"]=="custom_tool_call_output")== (call_style_by_id[call_id]=="wrapper"),"Codex call/output style join"); output_indices[call_id] = index; output_values[call_id]=payload.get("output")
        elif payload.get("type") in {"custom_tool_call","function_call","web_search_call","computer_call"}:
            raise PermanentMatrixError("Codex ordinary or unrecognized tool call")
    require(assistants and len(finals) == 1 and len(create_call_ids)==len(complete_call_ids)==1 and len(inspection_call_ids)<=1, "one verified Codex final/Goal lifecycle")
    prompt_indices=[]
    for i,item in enumerate(raw_rows):
        payload=item.get("payload") if item.get("type")=="response_item" else None
        if isinstance(payload,dict) and payload.get("type")=="message" and payload.get("role") in {"user","developer"} and V.text_blocks(payload.get("content"))==CODEX_PROMPT.read_text(): prompt_indices.append(i)
    require(len(prompt_indices)==1,"one exact external Codex prompt")
    index, payload, blocks = finals[0]
    require(index == assistants[-1][0] == response_indices[-1], "Codex final is last assistant terminal")
    create_index=next(i for i,item in enumerate(raw_rows) if item.get("type")=="response_item" and isinstance(item.get("payload"),dict) and item["payload"].get("call_id")==create_call_ids[0]); complete_index=next(i for i,item in enumerate(raw_rows) if item.get("type")=="response_item" and isinstance(item.get("payload"),dict) and item["payload"].get("call_id")==complete_call_ids[0])
    require(set(output_indices)==set(create_call_ids+complete_call_ids+inspection_call_ids),"exact paired Codex Goal outputs")
    require(len(set(call_styles))==1 and set(call_styles)<={"wrapper","direct"},"one consistent closed Codex Goal call encoding")
    if inspection_call_ids:
        inspect_id=inspection_call_ids[0]; inspect_index=next(i for i,item in enumerate(raw_rows) if item.get("type")=="response_item" and isinstance(item.get("payload"),dict) and item["payload"].get("call_id")==inspect_id); raw_inspection=output_values[inspect_id]; decoded=P.strict_loads(raw_inspection) if isinstance(raw_inspection,str) else raw_inspection; require(inspect_index<output_indices[inspect_id]<create_index and decoded=={"goal":None,"remainingTokens":None,"completionBudgetReport":None},"optional null pre-create get_goal")
    require(task_started[0][0] < contexts[0][0] <= prompt_indices[0] < create_index < output_indices[create_call_ids[0]] < complete_index < output_indices[complete_call_ids[0]] < index < task_complete[0][0] == len(raw_rows)-1,"exact Codex task/prompt/Goal/final ordering")
    require(task_complete[0][1].get("last_agent_message")==raw_final,"task_complete final text join")
    def goal_envelope(raw:Any)->dict[str,Any]:
        decoded=P.strict_loads(raw) if isinstance(raw,str) else raw; require(isinstance(decoded,dict) and set(decoded)=={"goal","remainingTokens","completionBudgetReport"} and isinstance(decoded["goal"],dict),"exact Codex Goal output envelope"); return decoded["goal"]
    active,completed=goal_envelope(output_values[create_call_ids[0]]),goal_envelope(output_values[complete_call_ids[0]]); require(active.get("status")=="active" and completed.get("status")=="complete","Codex Goal state receipts"); require(active.get("threadId")==completed.get("threadId") and active.get("createdAt")==completed.get("createdAt") and active.get("objective")==completed.get("objective")==objectives[create_call_ids[0]],"Codex Goal identity/objective joins"); objective=str(active.get("objective","")).lower(); require("storage" in objective and ("pipeline" in objective or "worknode" in objective or "work-node" in objective),"bounded Codex Goal objective")
    require(V.text_blocks(payload["content"]) == raw_final, "verified Codex final capture")
    entries = [{} for _ in range(index + 1)]
    for assistant_index, assistant, assistant_blocks in assistants:
        entries[assistant_index] = {"type": "message", "id": assistant.get("id"), "message": {"role": "assistant", "id": assistant.get("id"), "content": assistant_blocks}}
    structural = {"assistant_message_count": len(assistants), "final_text": raw_final}
    original = N.omp_session.load_physical_session
    try:
        N.omp_session.load_physical_session = lambda _path: (None, None, entries, path.read_bytes())
        return semantic_normalize(path, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
    finally:
        N.omp_session.load_physical_session = original
def verify_codex_raw(path: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    raw_terminal = copy.deepcopy(terminal)
    raw_terminal["final_assistant_text"] = terminal.get("raw_final_assistant_text", terminal.get("final_assistant_text"))
    rollout=path/"rollout.raw.jsonl"; require(rollout.is_file() and not rollout.is_symlink(),"Codex raw rollout")
    raw=P.load_jsonl(rollout); sessions=[item["payload"] for item in raw if item.get("type")=="session_meta" and isinstance(item.get("payload"),dict)]; require(len(sessions)==1 and raw[0].get("type")=="session_meta" and raw[0].get("payload")==sessions[0],"exact leading Codex session_meta"); session_id=sessions[0].get("id",sessions[0].get("session_id")); require(isinstance(session_id,str) and session_id,"Codex session identity")
    require(route==route_map()[selected_row()["route_id"]] and launch.get("model")==route["model"] and launch.get("thinking")==route["thinking"] and (launch.get("prompt_utf8_bytes"),launch.get("prompt_sha256"))==(4190,"3b46fff91df4b73819d7504557e17b81f51ecf032ca4921bf90f08f68afff26e"),"Codex launch route/effort/V15 prompt")
    require(not any((item.get("type")=="event_msg" and isinstance(item.get("payload"),dict) and item["payload"].get("type") in {"task_failed","turn_failed","retry"}) or "retry" in str(item.get("type","")).lower() for item in raw),"Codex no retry/failure events")
    normalized = normalize_codex(rollout, raw_terminal["final_assistant_text"])
    require(normalized["final_text"]==terminal.get("final_assistant_text") and terminal.get("qualification_credit")==0 and terminal.get("no_retry") is True,"Codex normalized terminal join")
    if "result_normalization" in terminal:
        require(all(terminal.get(key) == normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization")), "Codex raw/history normalization join")
    return session_id
def verify_codex_candidate(directory: Path, row: dict[str, Any], create: dict[str, Any], prompt: str, final: str) -> dict[str, Any]:
    launch = P.load_json(directory / "launch.json")
    provisional = {"final_assistant_text": final}
    projection = app.raw_projection(directory / "rollout.raw.jsonl", route_map()[row["route_id"]], prompt, create["threadId"], row["projectless_directory_name"], V, launch, provisional)
    normalized = normalize_codex(directory / "rollout.raw.jsonl", final)
    V.terminal_result(normalized["final_text"])
    projection.update({"raw_final_assistant_sha256": P.sha256_bytes(final.encode()), **{key: normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization", "final_text", "final_text_sha256")}})
    return projection
def app_write_terminal(directory: Path, row: dict[str, Any], route: dict[str, Any], pipeline: Any, *, status: str, final: str = "", identity: Any = None, failure: Any = None, external_submissions: int = 1) -> dict[str, Any]:
    issued = verify_issued(directory, row, P.load_json(directory / "launch.json")["git_custody"]) if status == "PASS" else None
    normalized = normalize_codex(directory / "rollout.raw.jsonl", final) if status == "PASS" else None
    terminal = ORIGINAL_APP_WRITE(directory, row, route, pipeline, status=status, final=normalized["final_text"] if normalized else final, identity=identity, failure=failure, external_submissions=external_submissions)
    if normalized:
        terminal.update({"raw_final_assistant_text": final, "raw_final_assistant_sha256": P.sha256_bytes(final.encode()), **{key: normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization")}})
        launch=P.load_json(directory/"launch.json"); terminal.update({"input_snapshot":launch["input_snapshot"],"input_snapshot_sha256":launch["input_snapshot_sha256"],"dependency_snapshot":launch["dependency_snapshot"],"dependency_snapshot_sha256":launch["dependency_snapshot_sha256"]})
    marker = directory / ISSUED
    if marker.is_file() and not marker.is_symlink(): terminal["create_request_issued"] = issued["record"] if issued else file_record(marker, directory)
    P.atomic_write(directory / "terminal.json", P.pretty_json(terminal))
    return terminal
def app_verify_direct(directory: Path, row: dict[str, Any], prompt: str, contract: dict[str, Any], pipeline: Any, verify: Any, launch: dict[str, Any], terminal: dict[str, Any]) -> dict[str, Any]:
    issued = verify_issued(directory, row, launch["git_custody"])
    raw_terminal = copy.deepcopy(terminal)
    raw_terminal["final_assistant_text"] = terminal.get("raw_final_assistant_text")
    projection = ORIGINAL_APP_DIRECT(AppEvidencePath(directory), row, prompt, contract, pipeline, verify, launch, raw_terminal)
    normalized = normalize_codex(directory / "rollout.raw.jsonl", raw_terminal["final_assistant_text"])
    raw_time = P.load_json(directory / "raw_copy_1.receipt.json")["source"]["observedAtUtc"]
    require(terminal.get("create_request_issued") == issued["record"] and issued["record"] in terminal["evidence"] and V.parse_utc(issued["value"]["issued_at_utc"]) <= V.parse_utc(raw_time) <= V.parse_utc(terminal["finished_at_utc"]) and terminal.get("final_assistant_text") == normalized["final_text"] and all(terminal.get(key) == normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization")), "Codex issuance/normalization join")
    require(terminal.get("input_snapshot")==launch.get("input_snapshot") and terminal.get("input_snapshot_sha256")==launch.get("input_snapshot_sha256"),"Codex terminal snapshot join")
    return projection
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
        (base, "run_row", G.PROMPT_READY_RUN_ROW), (base, "atomic_json", atomic_json), (base, "pipeline", G.PROXY), (base, "subprocess", SPROXY),
        (omp_session, "verify_submission_prefix", G.verify_submission_prefix), (omp_session, "verify_session", verify_session),
        (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map), (V, "expected_argv", verify_expected_argv),
        (V, "verify_omp_raw", verify_omp_raw), (V, "verify_codex_raw", verify_codex_raw), (V, "pipeline", G.PROXY),
        (app, "write_terminal", app_write_terminal), (app, "verify_direct_evidence", app_verify_direct),
        (G, "EVIDENCE", EVIDENCE), (G, "rows", glm_rows), (G, "row_dir", row_dir), (G, "session_health", session_health), (G, "NORMALIZE", semantic_normalize), (G, "cleanup_owned_snapshot", cleanup_selected_snapshot),
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
        permanent(str(target).startswith("/tmp/pm-r10-storage-v15-snapshot-"),"matrix snapshot cleanup scope"); G.remove_private_tree(target)
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
    dependency=dependency_verify(); dependency_sha=P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()); require(receipt.get("dependency_snapshot")==dependency and receipt.get("dependency_snapshot_sha256")==dependency_sha and all(item.get("dependency_snapshot")==dependency and item.get("dependency_snapshot_sha256")==dependency_sha for item in (launch,terminal)),"OMP dependency joins"); preflight_sha=P.sha256_file(directory/"omp_preflight.json"); state_sha=receipt.get("popen_state_receipt_sha256"); require(isinstance(receipt.get("popen_state_receipt"),dict) and all(item.get("final_omp_preflight_sha256")==preflight_sha and item.get("popen_state_receipt_sha256")==state_sha for item in (launch,terminal)),"OMP finalized preflight joins")
def verify_omp_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    directory = row_dir(row)
    receipt = P.load_json(directory / "omp_preflight.json")
    adapter = "native_default_semantic_v15"
    require(receipt.get("matrix_contract") == file_record(CONTRACT) and receipt.get("owned_sources") == custody["sources"] and receipt.get("dependency_custody") == custody["dependencies"], "OMP source/dependency receipt")
    require(receipt.get("git_custody") == custody and receipt.get("protocol_adapter") == adapter and receipt.get("row_time_budget_seconds") == 3600, "OMP custody/adapter")
    require(receipt.get("config_overlay")=={"goal.continuationModes":[],"recap.enabled":False} and "--config" not in receipt.get("expected_argv", []) and "--no-extensions" in receipt.get("expected_argv", []), "OMP config/argv")
    seed=receipt.get("profile_seed",{}); roster=["agent.db","config.yml","models.db","models.yml"] if row["route_id"]==GLM_ROUTE else ["agent.db","config.yml","models.db"]
    require(seed.get("seed_roster")==roster and seed.get("source_profile")==spec()["runtime"]["source_profile_dir"] and seed.get("environment_roots")=={name:row[field] for name,field in G.ENV_PATHS.items()} and seed.get("environment_roots_initially_empty") is True and seed.get("mcp_tool_extension_seed_files")==0 and seed.get("omp_profile")==seed.get("pi_profile")=="default", "exact route-local profile seed")
    require(receipt.get("catalog_refresh") is None and receipt.get("mimo_catalog_api_gate") is False, "matrix has no MiMo catalog/API gate")
    verify_omp_snapshot_fields(directory,receipt)
    structural=P.load_json(directory/"structural_projection.json"); normalized=P.load_json(directory/"normalized_projection.json"); enforce_no_continuation_or_recap(directory/"session.raw.jsonl",structural)
    require(semantic_normalize(directory/"session.raw.jsonl",structural,oracle_path=V7/"oracle.json",schema_path=V7/"response.schema.json",max_text_block_utf8_bytes=P.load_json(V7/"matrix.json")["max_final_assistant_utf8_bytes"])==normalized,"semantic replay")
    with selected(row): require(P.load_json(directory/"terminal.json").get("formal_chain")==formal_chain(),"generic OMP formal chain")
def verify_failed_row(row:dict[str,Any],journal_entry:dict[str,Any],custody:dict[str,Any])->dict[str,Any]:
    directory=row_dir(row); terminal_path=directory/"terminal.json"; failure_path=directory/"runner_failure.json"
    require(directory.is_dir() and not directory.is_symlink() and terminal_path.is_file() and failure_path.is_file(),"closed failed row evidence")
    terminal=P.load_json(terminal_path); failure=P.load_json(failure_path)
    require(terminal.get("status")=="FAIL" and terminal.get("qualification_credit")==0 and terminal.get("no_retry") is True,"permanent zero-credit failure")
    require(all(terminal.get(key)==row[key] for key in IDENTITY) and all(failure.get(key)==row[key] for key in IDENTITY),"failed row identity")
    launch=directory/"launch.json"; require(launch.is_file() and journal_entry.get("launch_sha256")==P.sha256_file(launch),"failed launch journal join")
    require(P.load_json(launch).get("git_custody")==custody,"failed source custody")
    for record in terminal.get("evidence",[]):
        require(set(record)=={"path","bytes","sha256"},"failed evidence record shape"); require(file_record(directory/record["path"],directory)==record,"failed evidence custody")
    return build_row_report(row,journal_entry,terminal)
def verify_matrix_tree(consumed:list[dict[str,Any]])->None:
    expected={"launch_journal.jsonl",*(row["pass_id"] for row in consumed)}; require(EVIDENCE.is_dir() and not EVIDENCE.is_symlink() and {p.name for p in EVIDENCE.iterdir()}==expected,"exact matrix evidence root")
    for pass_id in {row["pass_id"] for row in consumed}:
        directory=EVIDENCE/pass_id; routes={row["route_id"] for row in consumed if row["pass_id"]==pass_id}; require(directory.is_dir() and not directory.is_symlink() and {p.name for p in directory.iterdir()}==routes and all(p.is_dir() and not p.is_symlink() for p in directory.iterdir()),"exact pass evidence roster")
def verify_prefix() -> dict[str, Any]:
    require(not (EVIDENCE/"HOLD.json").exists(),"matrix HOLD blocks suffix/reinvoke")
    journal_path = EVIDENCE / "launch_journal.jsonl"
    journal = P.load_jsonl(journal_path) if journal_path.is_file() and not journal_path.is_symlink() else []
    frozen, routes = rows(), route_map()
    require(len(journal) <= 24, "journal maximum")
    reports: list[dict[str, Any]] = []
    custody = git_custody() if journal else None
    if not journal:
        require(not os.path.lexists(EVIDENCE), "empty prefix evidence absence")
    else:
        with installed():
            for row,entry in zip(frozen[:len(journal)],journal,strict=True):
                with active_row(row):
                    terminal=P.load_json(row_dir(row)/"terminal.json")
                    if terminal.get("status")=="PASS":
                        verified = V.verify_row(row["pass_id"], routes[row["route_id"]]); require(verified["status"] == "PASS", "verified PASS row")
                        if row["surface"] == "omp_tui": verify_omp_receipt(row, custody)
                        else:
                            directory = row_dir(row); launch = verify_app_launch(row, custody); issued = verify_issued(directory, row, custody); verify_issued_journal(journal, row, issued); app.verify_direct_evidence(directory, row, CODEX_PROMPT.read_text(), spec(), P, V, launch, terminal)
                        report=build_row_report(row,entry,terminal,verified)
                    else: report=verify_failed_row(row,entry,custody)
                    reports.append(report)
            mixed_journal(journal, reports); verify_global_outcomes(reports); verify_matrix_tree(frozen[:len(journal)])
    for row in frozen[len(journal):]:
        require(not os.path.lexists(row_dir(row)), "future evidence absent")
        require(not any(os.path.lexists(path) for path in runtime_paths(row)), "future runtime absent")
    pass_count=sum(report["status"]=="PASS" for report in reports); complete = len(journal) == 24
    return {"status": "PASS_TWO_CLEAN_NORMALIZED_PASSES" if complete and pass_count==24 else "COMPLETE_WITH_MODEL_FAILURES_ZERO_CREDIT" if complete else "PASS_EXACT_PREFIX_ZERO_CREDIT", "row_count": len(journal), "pass_count":pass_count,"fail_count":len(journal)-pass_count,"required_rows": 24, "qualification_credit": 1 if complete and pass_count==24 else 0, "subject_calls": 0}
def verify_app_partial(row: dict[str,Any]) -> str:
    d=row_dir(row); require(d.is_dir() and not d.is_symlink() and all(path.is_file() and not path.is_symlink() for path in d.iterdir()),"regular partial App files"); base_names={"reservation.json","launch.json","create_request.json",ISSUED}; names={path.name for path in d.iterdir()}; wait_names=sorted(name for name in names if re.fullmatch(r"wait_[0-9]{3}\.raw\.json",name)); expected_waits=[f"wait_{index:03d}.raw.json" for index in range(1,len(wait_names)+1)]; require(wait_names==expected_waits,"contiguous App waits")
    create_present="create_receipt.raw.json" in names; read_present="read_receipt.raw.json" in names; raw1="raw_copy_1.receipt.json" in names
    expected=set(base_names)
    if create_present:
        create=app_created(d,row); waits=app_waits(d,create); require(len(waits)==len(wait_names),"reparsed App waits"); expected|={"create_receipt.raw.json","host_events.jsonl",*wait_names}; requests=[P.load_json(d/"create_request.json"),*[app.wait_request(create,waits[:index],spec()["runtime"]["codex_wait_timeout_ms"]) for index in range(len(waits))]]; receipts=["create_receipt.raw.json",*wait_names]
        if read_present:
            require(waits and app.validate_wait(waits[-1]["result"],create),"App read after completed wait"); request=app.read_request(create,spec()); app.canonical_receipt((d/"read_receipt.raw.json").read_bytes(),P,"read_thread",request); requests.append(request); receipts.append("read_receipt.raw.json"); require(P.load_json(d/"raw_copy_request.json")==app.raw_request(row,create),"App raw request join"); expected|={"read_receipt.raw.json","raw_copy_request.json"}
            if raw1:
                receipt,content=app.raw_copy_receipt((d/"raw_copy_1.receipt.json").read_bytes(),P,app.raw_request(row,create),1); require((d/"rollout.read1.jsonl").read_bytes()==content and receipt["source"]["bytes"]==len(content),"App raw1 replay"); expected|={"raw_copy_1.receipt.json","rollout.read1.jsonl"}
    require(names==expected,"exact partial App stage roster")
    if create_present:
        events=P.load_jsonl(d/"host_events.jsonl"); tools=["create_thread",*(["wait_threads"]*len(wait_names)),*(["read_thread"] if read_present else [])]; require(len(events)==len(requests) and all(event=={"ordinal":index+1,"tool":tools[index],"request_sha256":P.sha256_bytes((P.canonical_json(requests[index])+"\n").encode()),"receipt_path":receipts[index],"receipt_bytes":(d/receipts[index]).stat().st_size,"receipt_sha256":P.sha256_file(d/receipts[index])} for index,event in enumerate(events)),"App event/request/receipt join")
    return "raw1" if raw1 else "read" if read_present else "wait" if wait_names else "create" if create_present else "issued"
def _verify_open_app(row: dict[str,Any],custody: dict[str,Any]) -> dict[str,Any]:
    require(row["surface"]=="codex_app" and not (EVIDENCE/"HOLD.json").exists(),"open App/HOLD")
    journal=P.load_jsonl(EVIDENCE/"launch_journal.jsonl") if (EVIDENCE/"launch_journal.jsonl").is_file() else []; prior_count=row["ordinal"]-1; require(len(journal) in {prior_count,row["ordinal"]},"open App journal stage")
    reports=[]
    with installed():
        for prior,entry in zip(rows()[:prior_count],journal[:prior_count],strict=True):
            with active_row(prior):
                terminal=P.load_json(row_dir(prior)/"terminal.json")
                if terminal.get("status")=="PASS":
                    verified=V.verify_row(prior["pass_id"],route_map()[prior["route_id"]]); require(verified["status"]=="PASS","open App prior PASS")
                    if prior["surface"]=="omp_tui": verify_omp_receipt(prior,custody)
                    else: app_verify_direct(row_dir(prior),prior,CODEX_PROMPT.read_text(),spec(),P,V,verify_app_launch(prior,custody),terminal)
                    report=build_row_report(prior,entry,terminal,verified)
                else: report=verify_failed_row(prior,entry,custody)
                reports.append(report)
    mixed_journal(journal[:prior_count],reports); verify_global_outcomes(reports); require(exact_reservation(row),"open App reservation")
    with active_row(row): launch=verify_app_launch(row,custody)
    issued=verify_issued(row_dir(row),row,custody); require(launch["create_request_issued"]==issued["record"],"open App issuance")
    if len(journal)==row["ordinal"]: verify_issued_journal(journal,row,issued); launch_value=P.load_json(row_dir(row)/"launch.json"); require(journal[-1]=={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{k:row[k] for k in IDENTITY},"started_at_utc":launch_value["started_at_utc"],"launch_sha256":P.sha256_file(row_dir(row)/"launch.json"),"omp_preflight_sha256":None,"app_create_observed":True,"pid":None,"create_request_issued":issued["record"]} and (not journal[:-1] or journal[-2]["started_at_utc"]<journal[-1]["started_at_utc"]),"exact current App journal entry")
    stage=verify_app_partial(row); require((stage!="issued")== (len(journal)==row["ordinal"]),"App create capture/journal atomic boundary"); expected_routes={prior["pass_id"]:{item["route_id"] for item in rows()[:prior_count] if item["pass_id"]==prior["pass_id"]} for prior in rows()[:prior_count]}; expected_routes.setdefault(row["pass_id"],set()).add(row["route_id"]); require(EVIDENCE.is_dir() and not EVIDENCE.is_symlink() and {path.name for path in EVIDENCE.iterdir()}=={"launch_journal.jsonl",*expected_routes},"open App root roster")
    for pass_id,route_ids in expected_routes.items(): pass_dir=EVIDENCE/pass_id; require(pass_dir.is_dir() and not pass_dir.is_symlink() and {path.name for path in pass_dir.iterdir()}==route_ids and all(path.is_dir() and not path.is_symlink() for path in pass_dir.iterdir()),"open App pass roster")
    for future in rows()[row["ordinal"]:]: require(not os.path.lexists(row_dir(future)),"future evidence absent during open App")
    return {"status":"PASS_OPEN_APP_PREFIX","stage":stage,"prior_rows":prior_count,"journal_rows":len(journal),"qualification_credit":0,"subject_calls":0}
def verify_open_app(row: dict[str,Any],custody: dict[str,Any]) -> dict[str,Any]:
    owned=G.SNAPSHOT_OWNED
    if owned: cleanup_selected_snapshot()
    try:
        with installed(): return _verify_open_app(row,custody)
    finally:
        if owned:
            G.prepare_input_snapshot(); require(G.SNAPSHOT_OWNED and G.SNAPSHOT_RECEIPT is not None and G.SNAPSHOT_RECEIPT["materialized_root"]==row["snapshot_dir"],"open App current snapshot restored")
def require_launch_authority(row: dict[str, Any]) -> None:
    authority = verified_authority()
    require(authority["runtime_launch_authorized"] is True and authority["provider_calls_authorized"] is True and authority["global_source_authority_custody_fail_stop"] is True, "runtime/provider authority not frozen")
    if row["surface"] == "codex_app":
        require(authority["codex_app_creation_authorized"] is True, "Codex App authority not frozen")
    require(row["attempt_id"] in authority["authorized_attempt_ids"] and len([item for item in rows() if all(item[key] == row[key] for key in (*IDENTITY, "surface", "model", "thinking"))]) == 1, "one exact authorized row")
def next_row(ordinal: int, prefix_count: int) -> dict[str, Any]:
    require(ordinal == prefix_count + 1 and 1 <= ordinal <= 24, "exact next ordinal")
    if ordinal>1:
        first=P.load_json(row_dir(rows()[0])/"terminal.json"); require(first.get("status")=="PASS","row1 spend/harness gate")
    return rows()[ordinal - 1]
def cleanup_private_capture(row:dict[str,Any])->None:
    if row.get("route_id")!=GLM_ROUTE: return
    path=Path(row["private_capture_dir"]); require(str(path)==f'/tmp/pm-r10-storage-v15-http-{row["nonce"]}',"private capture cleanup scope")
    if not os.path.lexists(path): return
    require(path.is_dir() and not path.is_symlink() and (path.stat().st_mode&0o777)==0o700 and all(item.is_file() and not item.is_symlink() and (item.stat().st_mode&0o777)==0o600 and item.stat().st_nlink==1 for item in path.iterdir()),"private capture custody before cleanup"); G.remove_private_tree(path); require(not os.path.lexists(path),"private capture cleanup")
ERRORS = (DependencyContamination, MatrixError, PermanentMatrixError, G.ControllerError, G.PermanentCanaryError, N.NormalizationError, app.LaneError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)
COMMANDS = ("lint", "verify-prefix", "run", "codex-create-request", "codex-wait-request", "codex-read-request", "codex-raw-request", "codex-ingest-create", "codex-ingest-wait", "codex-ingest-read", "codex-ingest-raw1", "codex-ingest-raw2")
def _dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=COMMANDS)
    parser.add_argument("ordinal", nargs="?", type=int, choices=range(1, 25))
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args(argv)
    row = None
    claim_before = None
    post_pass_hold = False
    output: dict[str, Any] | None = None
    rc = 0
    try:
        require((args.command in {"lint", "verify-prefix"}) == (args.ordinal is None), "ordinal command shape")
        static = validate_static(unused=args.command == "lint")
        if args.command == "lint":
            output = {"status": "PASS_ZERO_SUBJECT_LINT", **static}
        elif args.command == "verify-prefix":
            output = verify_prefix()
        else:
            if args.command == "run":
                prefix = verify_prefix()
                row = next_row(args.ordinal, prefix["row_count"])
            else:
                row = rows()[args.ordinal - 1]
            if row["surface"] == "omp_tui": validate_omp_paths(row)
            require_launch_authority(row)
            custody = git_custody()
            if args.command == "run" and row["surface"] == "omp_tui":
                with installed(), active_row(row):
                    runtime = G.current_runtime_preflight()
                require(runtime["status"] == "PASS_OMP_RUNTIME_18_0_7" and runtime["subject_calls"] == 0, "current OMP 18.0.7 pre-reservation runtime/config")
                require(git_custody() == custody, "source custody unchanged across runtime preflight before reservation")
            directory = row_dir(row)
            claim_before = tuple(os.path.lexists(path) for path in (EVIDENCE, directory.parent, directory))
            with installed(), active_row(row):
                if args.command == "run" and row["surface"] == "omp_tui":
                    require(args.max_seconds == 3600 and row["surface"] == "omp_tui", "frozen OMP command")
                    DISPATCH_CUSTODY = custody
                    G.DISPATCH_CUSTODY = custody
                    try:
                        terminal = base.run_row(row["pass_id"], row["route_id"], 3600)
                    finally:
                        DISPATCH_CUSTODY = None
                        G.DISPATCH_CUSTODY = None
                    output = {"status": "PASS_OMP_ROW_ZERO_CREDIT", "terminal": terminal, "qualification_credit": 0}
                else:
                    require(row["surface"] == "codex_app", "Codex command requires App row")
                    if args.command == "run":
                        launch = reserve_app(directory, row, custody)
                        output = issue_create(directory,row,custody)
                    else:
                        require(exact_reservation(row) and not (directory / "terminal.json").exists(), "exact unterminated App reservation")
                        if git_custody()!=P.load_json(directory/"launch.json")["git_custody"]: raise AlreadyIssuedNoMutation("APP_CUSTODY_DRIFT_NO_MUTATION")
                        verify_open_app(row,custody); launch = P.load_json(directory/"launch.json")
                        app_budget(directory)
                        if args.command == "codex-create-request":
                            require(not (directory / "create_receipt.raw.json").exists(), "create receipt absent")
                            output = issue_create(directory, row, custody)
                        elif args.command == "codex-wait-request":
                            verify_issued(directory, row, custody)
                            create = app_created(directory, row); prior = app_waits(directory, create)
                            require(len(prior) < spec()["runtime"]["codex_wait_max_receipts"] and (not prior or not app.validate_wait(prior[-1]["result"], create)), "wait open")
                            output = app.wait_request(create, prior, spec()["runtime"]["codex_wait_timeout_ms"])
                        elif args.command == "codex-read-request":
                            verify_issued(directory, row, custody)
                            create = app_created(directory, row); prior = app_waits(directory, create)
                            require(prior and app.validate_wait(prior[-1]["result"], create) and not (directory / "read_receipt.raw.json").exists(), "read ready")
                            output = app.read_request(create, spec())
                        elif args.command == "codex-raw-request":
                            verify_issued(directory, row, custody)
                            create = app_created(directory, row); output = app.raw_request(row, create)
                            if (directory/"raw_copy_1.receipt.json").is_file(): first,_content=app.raw_copy_receipt((directory/"raw_copy_1.receipt.json").read_bytes(),P,output,1); require(V.parse_utc(launch["started_at_utc"])<=V.parse_utc(P.load_json(directory/ISSUED)["issued_at_utc"])<=V.parse_utc(first["source"]["observedAtUtc"])<=V.parse_utc(base.utc_now()),"raw1 after launch/issuance before current observation")
                            require(P.load_json(directory / "raw_copy_request.json") == output, "raw request join")
                        else:
                            verify_issued(directory, row, custody)
                            raw_receipt=sys.stdin.buffer.read(); (require(len(raw_receipt)<=16*1024*1024,"bounded quarantined App receipt"),P.atomic_write(directory/"quarantine_receipt.raw",raw_receipt),(_ for _ in ()).throw(MatrixError("APP_CUSTODY_DRIFT_AFTER_STDIN_CONSUMED"))) if git_custody()!=custody else None; verify_open_app(row,custody); output = ingest(row, args.command.removeprefix("codex-ingest-"), raw_receipt)
            if (args.command == "run" and row["surface"]=="omp_tui") or args.command == "codex-ingest-raw2":
                post=verify_prefix(); require(post["row_count"]==row["ordinal"],"post-row prefix"); output["prefix"]=post
    except AlreadyIssuedNoMutation:
        return 2
    except base.ReservationConflict as exc:
        output, rc = {"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}, 1
    except ERRORS as exc:
        claimed = False
        if row is not None:
            with installed(), selected(row):
                claimed = claim_after_failure(row, claim_before)
                if claimed:
                    if global_contamination(exc):
                        if row["surface"]=="codex_app": fail_app(row,exc)
                        elif not (row_dir(row)/"terminal.json").is_file():
                            try: G.preserve_failure(row)
                            except Exception: pass
                            base.record_failure(row["pass_id"],row["route_id"],exc)
                        hold=write_hold(row,exc); output,rc={"status":"HOLD_GLOBAL_CONTAMINATION","error":hold["error"],"qualification_credit":0},1; claimed=False; post_pass_hold=True
                    elif row["surface"] == "codex_app":
                        if fail_app(row, exc):
                            hold=P.load_json(EVIDENCE/"HOLD.json"); output,rc={"status":"HOLD_POST_PASS_CONTROLLER_FAULT","error":hold["error"],"qualification_credit":0},1; claimed=False; post_pass_hold=True
                    else:
                        if (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS":
                            hold={"schema_id":"pm.r10.storage_pipeline.matrix_hold.v1","ordinal":row["ordinal"],"error":f"{type(exc).__name__}: {exc}","captured_at_utc":base.utc_now(),"suffix_blocked":True,"qualification_credit":0}
                            path=EVIDENCE/"HOLD.json"
                            if not path.exists(): P.atomic_write(path,P.pretty_json(hold))
                            output,rc={"status":"HOLD_POST_PASS_CONTROLLER_FAULT","error":hold["error"],"qualification_credit":0},1
                            claimed=False
                            post_pass_hold=True
                        else:
                            preservation_error: Exception | None = None
                            try:
                                G.preserve_failure(row)
                            except Exception as failure:
                                preservation_error = failure
                            finally:
                                recorded_error = exc if preservation_error is None else PermanentMatrixError(f"{type(exc).__name__}: {exc}; failure preservation error: {type(preservation_error).__name__}: {preservation_error}")
                                base.record_failure(row["pass_id"], row["route_id"], recorded_error)
                            if preservation_error is not None: exc = recorded_error
        if not post_pass_hold: output, rc = {"status": ("FAIL_ROW1_GATE_CONSUMED" if row and row["ordinal"]==1 else "FAIL_CONSUMED_CONTINUE_MATRIX") if claimed else "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}, 1
    finally:
        DISPATCH_CUSTODY = None
        G.DISPATCH_CUSTODY = None
        if row is not None:
            try: cleanup_private_capture(row)
            except ERRORS as cleanup_error:
                if (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS": write_hold(row,cleanup_error); output,rc={"status":"HOLD_POST_PASS_CONTROLLER_FAULT","error":f"{type(cleanup_error).__name__}: {cleanup_error}","qualification_credit":0},1
    try:
        require(dependency_verify()==DEPENDENCY_RECEIPT,"dependency snapshot before final stdout")
        if row is not None and row.get("surface")=="codex_app" and rc==0 and git_custody()!=P.load_json(row_dir(row)/"launch.json")["git_custody"]: raise MatrixError("APP_CUSTODY_DRIFT_AFTER_PASS_HOLD") if (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS" else AlreadyIssuedNoMutation("APP_CUSTODY_DRIFT_BEFORE_STDOUT_NO_MUTATION")
        if row is not None and (args.command == "codex-create-request" or (args.command == "run" and row.get("surface")=="codex_app")) and rc == 0: sys.stdout.write(emittable_create(row_dir(row), row, git_custody()))
        else: print(P.canonical_json(output))
    except AlreadyIssuedNoMutation:
        return 2
    except Exception as exc:
        held=False
        if row is not None:
            terminal_path=row_dir(row)/"terminal.json"; passed=terminal_path.is_file() and not terminal_path.is_symlink() and P.load_json(terminal_path).get("status")=="PASS"
            if passed or (isinstance(exc,DependencyContamination) and row_claimed(row)): write_hold(row,exc); held=True
            elif row.get("surface") == "codex_app" and os.path.lexists(row_dir(row) / ISSUED):
                with installed(), selected(row): held=fail_app(row, exc)
        if held: sys.stderr.write(P.canonical_json({"status":"HOLD_POST_PASS_CONTROLLER_FAULT","error":f"{type(exc).__name__}: {exc}","qualification_credit":0})+"\n")
        return 1
    return rc
def dispatch(argv: list[str] | None = None) -> int:
    try:
        with G.forbid_live_plan_reads(): return _dispatch(argv)
    finally: DB.cleanup()
if __name__ == "__main__":
    raise SystemExit(dispatch())
