#!/usr/bin/env python3
import argparse
import contextlib
import copy
import importlib.util
import json
import os
import re
import stat
import subprocess
import sys
import shutil
import tempfile
from pathlib import Path
from typing import Any, Iterator
HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
V2 = R10 / "storage_native_matrix_v2"
V3 = R10 / "storage_mimo_normalized_canary_v3"
NORMALIZER = V3 / "result_normalizer.py"
CANARY_AUTHORITY = R10 / "STORAGE_MIMO_NORMALIZED_CANARY_V3_AUTHORITY.json"
CANARY_PUSH_CUSTODY = R10 / "STORAGE_MIMO_NORMALIZED_CANARY_V3_PUSH_CUSTODY.json"
CANARY_SOURCE_COMMIT = "fccf63c813e185c715293005f7f7390d28a850ae"
CANARY_EVIDENCE_COMMIT = "7c017517c48ce678eea580a1639ef16d7d6bd408"
CANARY_CLOSURE_COMMIT = "bd2da304e75d4a551f80f5ddba969f4531f7a385"
for _path in (V7,):
    sys.path.insert(0, str(_path))
def _load(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"module unavailable: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module
G = _load("storage_mimo_normalized_canary_v3_base", V3 / "controller.py")
P, V, base, omp_session, freeze_check = G.P, G.V, G.base, G.omp_session, G.freeze_check
app = _load("matrix_v6_codex_app_lane", V2 / "codex_app_lane.py")
N = _load("storage_mimo_normalized_canary_v3_semantic_normalizer", NORMALIZER)
CONTRACT = HERE / "matrix_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "matrix_contract.json", "controller.py", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
MIMO_ROUTE = "omp_mimo_v25_free_high"
ENV_FIELDS = tuple(G.ENV_PATHS.values())
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
    dependencies = [git_file(record["path"]) for record in spec()["dependencies"]]
    require([{key: item[key] for key in ("path", "bytes", "sha256")} for item in dependencies] == spec()["dependencies"], "dependency custody")
    return {"candidate_commit": values[0], "head": values[0], "origin_main": values[1], "truenas_backup_main": values[2], "sources": owned, "dependencies": dependencies}
def runtime_paths(row: dict[str, Any]) -> list[str]:
    fields = ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_FIELDS)
    return [row[field] for field in fields if row.get(field)]
def validate_omp_paths(row: dict[str, Any]) -> dict[str, str]:
    require(row.get("surface") == "omp_tui" and re.fullmatch(r"[0-9a-f]{32}", str(row.get("nonce"))) is not None, "OMP path identity")
    nonce = row["nonce"]
    expected = {field: (f"/tmp/pm-r10-storage-v7-normalized-matrix-v6-cwd-{nonce}" if field == "cwd" else f"/tmp/pm-r10-storage-v7-{stem}-normalized-matrix-v6-{nonce}") for field, stem in OMP_PATH_STEMS.items()}
    require(all(row.get(field) == value for field, value in expected.items()), "exact normalized matrix V6 OMP paths")
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
    require(authority["authority_source"] == "explicit_current_active_goal_and_user_matrix_direction_separate_from_v3_custody", "separate current authority")
    require(authority["active_goal"]["thread_id"] == "01a034b9-a1c8-7a80-937f-4e45e3f2ae45" and authority["active_goal"]["objective_sha256"] == "560a6b2e6852f351fd5d95e1ed44ec0f5044dab367318b20458c3cd76139c406", "active Goal identity")
    require(authority["authorized_attempt_ids"] == [row["attempt_id"] for row in frozen] and authority["authorized_row_count"] == 24, "exact authorized attempts")
    require(P.sha256_bytes(P.canonical_json(frozen).encode()) == authority["authorized_rows_canonical_sha256"], "authorized rows digest")
    require(authority["runtime_launch_authorized"] is authority["provider_calls_authorized"] is authority["codex_app_creation_authorized"] is True, "matrix runtime authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized","plans_or_ledgers_authorized","windows_interaction_authorized","worknodes_authorized")), "authority ceiling")
    verify_pinned_canary()
    return authority
class AppEvidencePath(type(Path())):
    def iterdir(self) -> Iterator[Path]:
        return (path for path in super().iterdir() if path.name != ISSUED)
def verify_issued(directory: Path, row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    path = directory / ISSUED; require(path.is_file() and not path.is_symlink(), "immutable create issuance marker")
    value, request = P.load_json(path), app.create_request(row, (V7 / "prompts/codex.prompt.txt").read_text()); raw = (P.canonical_json(request) + "\n").encode()
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
    require(git_custody() == custody, "custody at create issuance"); request = app.create_request(row, (V7 / "prompts/codex.prompt.txt").read_text()); raw = (P.canonical_json(request) + "\n").encode()
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
    snapshot=verify_selected_pipeline(); launch=app.reserve(d,row,(V7/"prompts/codex.prompt.txt").read_text(),P,base.utc_now); digest=G.snapshot_digest(snapshot); launch.update({"matrix_contract":file_record(CONTRACT),"owned_sources":custody["sources"],"dependency_custody":custody["dependencies"],"git_custody":custody,"protocol_adapter":"codex_app_host_receipt_semantic_v6","parent_allowed_calls":["create_thread","wait_threads","read_thread"],"input_snapshot":snapshot,"input_snapshot_sha256":digest,"row_time_budget_seconds":3600,"qualification_credit":0}); P.atomic_write(d/"launch.json",P.pretty_json(launch)); return launch
def verify_app_launch(row: dict[str,Any],custody: dict[str,Any]) -> dict[str,Any]:
    snapshot=verify_selected_pipeline(); launch=P.load_json(row_dir(row)/"launch.json"); require(launch["matrix_contract"]==file_record(CONTRACT) and launch["git_custody"]==custody and launch["dependency_custody"]==custody["dependencies"],"App custody"); require(launch["protocol_adapter"]=="codex_app_host_receipt_semantic_v6" and launch["parent_allowed_calls"]==["create_thread","wait_threads","read_thread"],"App lane"); require(launch["input_snapshot"]==snapshot and launch["input_snapshot_sha256"]==G.snapshot_digest(snapshot),"App pipeline/snapshot join"); return launch
def mixed_journal(journal: list[dict[str,Any]],reports: list[dict[str,Any]]) -> None:
    require(len(journal)==len(reports),"journal length")
    for report,actual in zip(reports,journal,strict=True):
        frozen=rows()[report["ordinal"]-1]; require(all(actual.get(k)==frozen[k] for k in IDENTITY),"journal identity"); require(actual["launch_sha256"]==report["launch_sha256"] and actual.get("omp_preflight_sha256")==report.get("omp_preflight_sha256"),"journal hashes")
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
    d=row_dir(row); require(exact_reservation(row) and not (d/"terminal.json").exists(),"open App reservation"); app_budget(d); prompt=(V7/"prompts/codex.prompt.txt").read_text(); create_request=app.create_request(row,prompt)
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
    require(contract["schema_id"] == "pm.r10.storage_normalized_matrix.v6" and contract["status"] == "FROZEN_PRELAUNCH_ZERO_CREDIT" and contract["normalization"]=={"schema_id":"pm.r10.storage_pipeline.matrix_semantic_normalizer.v2","source":"storage_normalized_matrix_v6/controller.py","function":"semantic_normalize","source_sha256":P.sha256_file(HERE/"controller.py"),"v3_helper_role":"strict_load_typed_equal_schema_only_and_historical_lineage","benign":["object_key_order","json_whitespace","surrounding_prose","candidate_location"],"strict":["schema","types","values","list_order","duplicate_keys","nonfinite","malformed","conflicts","zero_candidates"],"cursor_location_exception":["omp_session.require:OMP Cursor aggregate result absent before Goal call","omp_session.require:OMP Cursor aggregate result follows Goal call"],"restore_in_finally":True,"cursor_exception_source":"system_pipeline_sandbox_v7/omp_session.py","cursor_exception_source_sha256":"1a578d20678b7d360d0bafdc94c26661ea9f4ae2318e97ba1f67e6a1a6f9280e"}, "V6 contract/normalizer custody")
    actual = {path.name for path in HERE.iterdir()}; require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES)|{"evidence"}), "root roster")
    metrics = {name:metric(HERE/name) for name in SOURCES}; limits=contract["architecture_limits"]
    require(metrics["controller.py"]["lines"]<=limits["controller_max_lines"] and metrics["selftest.py"]["lines"]<=limits["selftest_max_lines"] and sum(x["lines"] for x in metrics.values())<=limits["package_max_lines"] and sum(x["bytes"] for x in metrics.values())<=limits["package_max_bytes"], "architecture limits")
    require([route["id"] for route in routes] == contract["route_order"] and [row["route_id"] for row in frozen[:12]] == contract["route_order"] == [row["route_id"] for row in frozen[12:]], "route order twice")
    require([row["ordinal"] for row in frozen] == list(range(1,25)) and len({row["attempt_id"] for row in frozen}) == len({row["nonce"] for row in frozen}) == 24, "24 fresh identities")
    prompt=V7/"prompts/omp.prompt.txt"; require((prompt.stat().st_size,P.sha256_file(prompt))==(3036,"eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638"), "OMP prompt")
    codex_prompt=V7/"prompts/codex.prompt.txt"; require((codex_prompt.stat().st_size,P.sha256_file(codex_prompt))==(3050,"15242f325366e8f66e485ca80f03d239c0ab2b6d1e450e08e77d888ef5d14c38"),"Codex prompt")
    for row in frozen:
        expected_prompt=(3036,"eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638") if row["surface"]=="omp_tui" else (3050,"15242f325366e8f66e485ca80f03d239c0ab2b6d1e450e08e77d888ef5d14c38")
        require(row["evidence_path"] == f'evidence/{row["pass_id"]}/{row["route_id"]}' and (row["prompt_utf8_bytes"],row["prompt_sha256"])==expected_prompt, "row prompt/evidence")
        if row["surface"]=="omp_tui": validate_omp_paths(row)
    require(len(expected_records("dependencies")) == contract["dependency_count"] and not any("storage_normalized_matrix_v5" in item["path"] or "storage_glm53" in item["path"] or item["path"].endswith("models.yml") for item in contract["dependencies"]), "clean dependencies")
    require(contract["snapshot"]["commit"] == G.SNAPSHOT_COMMIT and contract["snapshot"]["entry_count"] == 6097, "V3 snapshot")
    require((V7/"prompts/codex.prompt.txt").read_text().startswith("Create a goal that"), "Codex Goal prompt")
    historical_identity_clean(frozen); verified_authority()
    if unused:
        require(not os.path.lexists(EVIDENCE), "evidence absent")
        require(not any(os.path.lexists(path) for row in frozen for path in runtime_paths(row)), "runtime absent")
    return {"status":"PASS_LOCAL_MATRIX_V6_PRELAUNCH", "rows":24, "subject_calls":0, "qualification_credit":0, "metrics":metrics}
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
            permanent(argv == expected_argv(route, row) and "--config" not in argv and "--no-extensions" in argv, "exact OMP argv")
            permanent(DISPATCH_CUSTODY == git_custody(), "custody before Popen")
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
    receipt.update({"matrix_contract": file_record(CONTRACT), "owned_sources": DISPATCH_CUSTODY["sources"], "dependency_custody": DISPATCH_CUSTODY["dependencies"], "git_custody": DISPATCH_CUSTODY, "profile_seed": seed, "protocol_adapter": "native_default_semantic_v6", "config_overlay": None, "catalog_refresh": catalog, "mimo_catalog_api_gate": row["route_id"] == MIMO_ROUTE, "row_time_budget_seconds": 3600, "expected_argv": expected_argv(route, row), "qualification_credit": 0, "input_snapshot": G.verify_input_snapshot(), "input_snapshot_sha256": G.snapshot_digest(G.verify_input_snapshot())})
    G.ORIGINAL_ATOMIC(path / "omp_preflight.json", receipt)
    return receipt
def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
    if selected_row()["route_id"] == MIMO_ROUTE:
        return G.composer_transition(before, after)
    permanent(isinstance(before, bytes) and isinstance(after, bytes) and before and after.startswith(before), "composer snapshot")
    pre, post, delta = base.strip_terminal(before), base.strip_terminal(after), base.strip_terminal(after[len(before):])
    markers = ("📄 #1".encode(), b"/goal Audit", "❯ 📄 #1".encode())
    submitted = row_dir() / "stdin_prompt.raw"
    permanent(submitted.is_file() and not submitted.is_symlink() and submitted.read_bytes() == (V7 / "prompts/omp.prompt.txt").read_bytes(), "submitted prompt")
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
    names=("reservation.json","omp_preflight.json","launch.json","submission_acceptance.json","session.raw.jsonl","structural_projection.json","normalized_projection.json"); records={name:file_record(row_dir()/name,row_dir()) for name in names}; return {"schema_id":"pm.r10.storage_pipeline.semantic_omp_formal_chain.v6","ordered_paths":list(names),"records":records}
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
def normalize_codex(path: Path, raw_final: str) -> dict[str, Any]:
    raw_rows = P.load_jsonl(path)
    assistants = []
    finals = []
    response_indices = []
    complete_call_ids = []
    output_indices = {}
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
            kind, _objective = V.parse_goal_wrapper(payload["input"])
            if kind == "update_goal":
                complete_call_ids.append(payload.get("call_id"))
        elif payload.get("type") == "custom_tool_call_output":
            output_indices[payload.get("call_id")] = index
    require(assistants and len(finals) == 1, "one verified Codex final")
    index, payload, blocks = finals[0]
    require(index == assistants[-1][0] == response_indices[-1], "Codex final is last assistant terminal")
    require(len(complete_call_ids) == 1 and output_indices.get(complete_call_ids[0], index) < index, "Codex final after Goal complete")
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
    session_id = ORIGINAL_CODEX_RAW(path, route, launch, raw_terminal)
    normalized = normalize_codex(path / "rollout.raw.jsonl", raw_terminal["final_assistant_text"])
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
        launch=P.load_json(directory/"launch.json"); terminal.update({"input_snapshot":launch["input_snapshot"],"input_snapshot_sha256":launch["input_snapshot_sha256"]})
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
        permanent(str(target).startswith("/tmp/pm-r10-storage-v7-snapshot-normalized-matrix-v6-"),"matrix snapshot cleanup scope"); G.remove_private_tree(target)
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
    adapter = "native_default_semantic_v6"
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
    require(len(journal) <= 24, "journal maximum")
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
                    if row["surface"] == "omp_tui":
                        verify_omp_receipt(row, custody)
                    else:
                        directory = row_dir(row)
                        launch = verify_app_launch(row, custody)
                        issued = verify_issued(directory, row, custody); verify_issued_journal(journal, row, issued)
                        app.verify_direct_evidence(directory, row, (V7 / "prompts/codex.prompt.txt").read_text(), spec(), P, V, launch, P.load_json(directory / "terminal.json"))
                    reports.append(report)
            mixed_journal(journal, reports)
            grouped = [{"pass_id": pass_id, "rows": [report for report in reports if frozen[report["ordinal"] - 1]["pass_id"] == pass_id]} for pass_id in ("pass_01", "pass_02")]
            grouped = [group for group in grouped if group["rows"]]
            V.verify_launch_journal(grouped)
            V.verify_evidence_tree(grouped)
            V.verify_global_uniqueness(grouped)
    for row in frozen[len(journal):]:
        require(not os.path.lexists(row_dir(row)), "future evidence absent")
        require(not any(os.path.lexists(path) for path in runtime_paths(row)), "future runtime absent")
    complete = len(journal) == 24
    return {"status": "PASS_TWO_CLEAN_NORMALIZED_PASSES" if complete else "PASS_EXACT_PREFIX_ZERO_CREDIT", "row_count": len(journal), "required_rows": 24, "qualification_credit": 1 if complete else 0, "subject_calls": 0}
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
        for prior in rows()[:prior_count]:
            with active_row(prior):
                report=V.verify_row(prior["pass_id"],route_map()[prior["route_id"]]); require(report["status"]=="PASS","open App prior PASS")
                if prior["surface"]=="omp_tui": verify_omp_receipt(prior,custody)
                else: app_verify_direct(row_dir(prior),prior,(V7/"prompts/codex.prompt.txt").read_text(),spec(),P,V,verify_app_launch(prior,custody),P.load_json(row_dir(prior)/"terminal.json"))
                reports.append(report)
    mixed_journal(journal[:prior_count],reports); grouped=[{"pass_id":pass_id,"rows":[report for report in reports if rows()[report["ordinal"]-1]["pass_id"]==pass_id]} for pass_id in ("pass_01","pass_02")]; grouped=[group for group in grouped if group["rows"]]
    with tempfile.TemporaryDirectory(prefix="pm-r10-v6-prior-journal-") as temporary:
        previous=V.EVIDENCE; V.EVIDENCE=Path(temporary); P.atomic_write(V.EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes(journal[:prior_count]))
        try: V.verify_launch_journal(grouped)
        finally: V.EVIDENCE=previous
    V.verify_global_uniqueness(grouped); require(exact_reservation(row),"open App reservation")
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
    require(authority["runtime_launch_authorized"] is True and authority["provider_calls_authorized"] is True and authority["exact_ordinal_prefix_fail_stop_required"] is True, "runtime/provider authority not frozen")
    if row["surface"] == "codex_app":
        require(authority["codex_app_creation_authorized"] is True, "Codex App authority not frozen")
    require(row["attempt_id"] in authority["authorized_attempt_ids"] and len([item for item in rows() if all(item[key] == row[key] for key in (*IDENTITY, "surface", "model", "thinking"))]) == 1, "one exact authorized row")
def next_row(ordinal: int, prefix_count: int) -> dict[str, Any]:
    require(ordinal == prefix_count + 1 and 1 <= ordinal <= 24, "exact next ordinal")
    return rows()[ordinal - 1]
ERRORS = (MatrixError, PermanentMatrixError, G.ControllerError, G.PermanentCanaryError, N.NormalizationError, app.LaneError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)
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
                    if row["surface"] == "codex_app":
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
        if not post_pass_hold: output, rc = {"status": "FAIL_CONSUMED_STOP_SUFFIX" if claimed else "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}, 1
    finally:
        DISPATCH_CUSTODY = None
        G.DISPATCH_CUSTODY = None
    try:
        if row is not None and row.get("surface")=="codex_app" and rc==0 and git_custody()!=P.load_json(row_dir(row)/"launch.json")["git_custody"]: raise MatrixError("APP_CUSTODY_DRIFT_AFTER_PASS_HOLD") if (row_dir(row)/"terminal.json").is_file() and P.load_json(row_dir(row)/"terminal.json").get("status")=="PASS" else AlreadyIssuedNoMutation("APP_CUSTODY_DRIFT_BEFORE_STDOUT_NO_MUTATION")
        if row is not None and (args.command == "codex-create-request" or (args.command == "run" and row.get("surface")=="codex_app")) and rc == 0: sys.stdout.write(emittable_create(row_dir(row), row, git_custody()))
        else: print(P.canonical_json(output))
    except AlreadyIssuedNoMutation:
        return 2
    except Exception as exc:
        held=False
        if row is not None and row.get("surface") == "codex_app" and os.path.lexists(row_dir(row) / ISSUED):
            with installed(), selected(row): held=fail_app(row, exc)
        if held: sys.stderr.write(P.canonical_json({"status":"HOLD_POST_PASS_CONTROLLER_FAULT","error":f"{type(exc).__name__}: {exc}","qualification_credit":0})+"\n")
        return 1
    return rc
def dispatch(argv: list[str] | None = None) -> int:
    with G.forbid_live_plan_reads():
        return _dispatch(argv)
if __name__ == "__main__":
    raise SystemExit(dispatch())
