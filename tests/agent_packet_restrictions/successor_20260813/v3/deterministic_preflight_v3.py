#!/usr/bin/env python3
"""Read-only successor V3 deterministic preflight checker."""

import sys

AUDIT = {"write": 0, "process": 0, "network": 0, "dynamic": 0}


def _audit(event, args):
    if event == "open":
        mode = args[1] if len(args) > 1 else None
        flags = args[2] if len(args) > 2 else 0
        if ((isinstance(mode, str) and any(c in mode for c in "wax+")) or
                (isinstance(flags, int) and flags & (1 | 2 | 64 | 512 | 1024))):
            AUDIT["write"] += 1
            raise PermissionError("V3 checker blocked a write-capable open")
    if event.startswith(("subprocess.", "os.exec", "os.spawn", "os.fork", "pty.spawn")):
        AUDIT["process"] += 1
        raise PermissionError("V3 checker blocked process creation")
    if event.startswith(("socket.", "http.", "urllib.")):
        AUDIT["network"] += 1
        raise PermissionError("V3 checker blocked network activity")
    if event in {"ctypes.dlopen"}:
        AUDIT["dynamic"] += 1
        raise PermissionError("V3 checker blocked dynamic loading")
    if event in {"os.remove", "os.rename", "os.rmdir", "os.mkdir", "os.link", "os.symlink",
                 "os.chmod", "os.chown", "os.truncate"}:
        AUDIT["write"] += 1
        raise PermissionError("V3 checker blocked filesystem mutation")


sys.addaudithook(_audit)

import ast
import hashlib
import json
import os
import stat
import zipfile
from pathlib import Path

REPO = Path("/mnt/Cursor/PuppetMaster")
HIST = REPO / "tests/agent_packet_restrictions"
ROOT = HIST / "successor_20260813"
V3 = ROOT / "v3"
CHECKER = V3 / "deterministic_preflight_v3.py"

CHECK_IDS = (
    "V3-CTL-001", "V3-JSON-001", "V3-ROOT-001", "V3-PRED-001",
    "V3-CUST-001", "V3-ARC-001", "V3-HIST-001", "V3-HIST-002",
    "V3-CENSUS-001", "V3-CHAT-001", "V3-JARED-001", "V3-CALL-001",
    "V3-SELF-001", "V3-SELF-002", "V3-SELF-003", "V3-TERM-001",
    "V3-IO-001", "V3-BOUNDARY-001", "V3-REPORT-001",
)

EXPECTED_FILES = {
    "attempt_manifest.json", "boundary_observation.json", "deterministic_preflight_report.json",
    "deterministic_preflight_spec.json", "deterministic_preflight_v3.py",
    "historical_artifact_disposition.json", "no_subject_activity.json", "predecessor_lineage.json",
    "process_contract.md", "readiness_report.md", "refreshed_surface_census.json",
    "source_custody.json", "test_design_questions.json",
}

V1_PINS = {
    "control_plane_defect-0001-successor-verifier-temp-write.md": "0e6ae97e747ad834a8f9a0b143f748eef861d50ab1ce0defb565c7459e3bcaa2",
    "deterministic_preflight.py": "c07dcff3191b94ab340ae169e4951c53660b618013bf4ad8790cbf1295d895f9",
    "deterministic_preflight_report.json": "094c245a96252cdc05a6a8e6bb07b5b2389f896482d15c0ff3c40e2018bbab89",
    "deterministic_preflight_spec.json": "8a1d0e79c95c20ff4d010f605069d7b70e56d28b34e03678ebd63b4867ae28a8",
    "historical_artifact_disposition.json": "3e5d1d5285ab13d7dd198fbe464364f41b1cb73744be1ddc3343f9379aa9660c",
    "process_contract.md": "457a27d9238f6e770160119de75c45c26faf28626399cc1aa1a7cdb589a89edb",
    "readiness_report.md": "da1ecf41a957f6501c34f640df638796dda4b95888c50f65407e6a43a3744b9a",
    "refreshed_surface_census.json": "dc0012817997f6e0272818edf68201432907176640ce388a15a55fefd7847b22",
    "source_custody.json": "c6f78062dfedd1e7a3cdbd8c0cc91e03481137b09fac4ef7dfd1cf93a4d8abb7",
    "test_design_questions.json": "0e81e263e8942c74ea8bf442ae58910ea9e3991152911bec7071f58421ad8d38",
}

V2_PINS = {
    "attempt_manifest.json": "779f1dca784f8d9aa043d9b7e148e78f93e11872b7a3d93119cda1f79934785e",
    "boundary_observation.json": "27f51e8e4bb9d39d269748805fcdaa2c164ed09a63cbdad8ec1f532b1e1ddd75",
    "control_plane_defect-0001-diagnostic-shell-redirection.md": "8cb34d8fe574272b2d935ba63ee48642d4c5a62f8e003ca4850493ef8b51373d",
    "deterministic_preflight_report.json": "5c0ece58711781ce6254c1ff4522ddb68e85eaeb2864351d53d38fcef5ec811a",
    "deterministic_preflight_spec.json": "387d43eca8c23ba0f67756ff601c9c6c4f9f53d464dedb810dde4c0c6901cb8a",
    "historical_artifact_disposition.json": "71c36ffa719a521662c58c70560361dfc46674ee84298172f4906e76dda98712",
    "no_subject_activity.json": "b9a70cc6c7d50c796305fa28451ff50e3bc9dc530f9fe829abc0294f7fa3acf6",
    "process_contract.md": "899a5b74a2b79ce3ef4b7a7a51073361b0553f15b367283de3db7fbf2ba16ef3",
    "readiness_report.md": "9548d223bde73e6a0b5b05e1cd50cafe022cf0f447b9a6c0523780a912c84e5b",
    "refreshed_surface_census.json": "4c2565e9c2c78b90de144a656bbda88a2664841ce509ddc375d2d06cd60d3055",
    "source_custody.json": "f10eab45cd7e2b924e0564441d0708424e5dbddda4595a6574c0c59c70e9fd34",
    "test_design_questions.json": "fbb140b8115efc52a0e9ebd4d2646c0f3d13e805cef4f61bd4b8e734027f2e17",
    "v1_lineage_manifest.json": "5448212a5366c42cd03f59c49235481425759eaee0c3f7e59fc5f5fe9d5a8a61",
}

READS = {}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read_bytes(path):
    path = Path(path)
    st = path.lstat()
    if not stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode) or st.st_nlink != 1:
        raise ValueError("not a single-link regular file: " + str(path))
    data = path.read_bytes()
    READS.setdefault(str(path), (sha(data), st.st_size, st.st_mode, st.st_mtime_ns))
    return data


def strict_load_bytes(raw):
    text = raw.decode("utf-8")

    def pairs(items):
        out = {}
        for key, value in items:
            if key in out:
                raise ValueError("duplicate JSON key: " + key)
            out[key] = value
        return out

    return json.loads(text, object_pairs_hook=pairs,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError("nonfinite: " + value)))


def load(path):
    return strict_load_bytes(read_bytes(path))


def is_int(value):
    return type(value) is int


def check(check_id, fn):
    try:
        evidence = fn()
        return {"check_id": check_id, "status": "pass", "evidence": evidence or {}}
    except Exception as exc:
        return {"check_id": check_id, "status": "fail", "error": type(exc).__name__ + ": " + str(exc)}


def ensure(condition, message):
    if not condition:
        raise ValueError(message)


def json_canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def ctl_check():
    ensure(sys.flags.isolated == 1 and sys.dont_write_bytecode, "requires -I -B")
    ensure(len(sys.argv) == 1 and Path(sys.argv[0]).resolve() == CHECKER, "unexpected argv or checker path")
    ensure(not stat.S_ISREG(os.fstat(sys.stdout.fileno()).st_mode), "stdout must not be a regular file")
    source = read_bytes(CHECKER).decode("utf-8")
    source_digest = sha(source.encode())
    manifest = load(V3 / "attempt_manifest.json")
    ensure(manifest["checker"]["sha256"] == source_digest, "checker hash does not match attempt manifest")
    tree = ast.parse(source)
    allowed_imports = {"sys", "ast", "hashlib", "json", "os", "stat", "zipfile", "pathlib"}
    forbidden_imports = {"tempfile", "subprocess", "socket", "urllib", "http", "requests", "shutil",
                         "ctypes", "mmap", "importlib", "multiprocessing", "asyncio"}
    forbidden_names = {"eval", "exec", "compile", "__import__", "system", "popen", "spawn", "fork"}
    forbidden_attrs = {"write_text", "write_bytes", "touch", "mkdir", "unlink", "rename", "replace",
                       "rmdir", "symlink_to", "hardlink_to", "chmod", "chown", "truncate"}
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                top = alias.name.split(".")[0]
                ensure(top in allowed_imports and top not in forbidden_imports, "forbidden import " + top)
        if isinstance(node, ast.ImportFrom):
            top = (node.module or "").split(".")[0]
            ensure(top in allowed_imports and top not in forbidden_imports, "forbidden import-from " + top)
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                ensure(node.func.id not in forbidden_names, "forbidden call " + node.func.id)
                if node.func.id == "open" and len(node.args) > 1 and isinstance(node.args[1], ast.Constant):
                    ensure(not any(c in str(node.args[1].value) for c in "wax+"), "write open")
            if isinstance(node.func, ast.Attribute):
                ensure(node.func.attr not in forbidden_attrs, "forbidden method " + node.func.attr)
    return {"source_sha256": source_digest, "isolated": True, "bytecode_disabled": True,
            "stdout_regular_file": False}


def json_check():
    for raw in (b'{"a":1,"a":2}', b'{"a":{"b":1,"b":2}}', b'{"a":NaN}', b'{"a":Infinity}', b'{"a":-Infinity}'):
        try:
            strict_load_bytes(raw)
        except (ValueError, UnicodeError):
            pass
        else:
            raise ValueError("strict JSON accepted invalid case")
    try:
        strict_load_bytes(b'\xff')
    except UnicodeError:
        pass
    else:
        raise ValueError("invalid UTF-8 accepted")
    ensure(is_int(0) and not is_int(False) and not is_int(0.0), "typed integer oracle failed")
    return {"negative_cases": 7, "boolean_integer_impostor_rejected": True}


def root_check():
    ensure(V3.resolve() == V3 and V3.is_dir() and not V3.is_symlink(), "bad V3 root")
    actual = set()
    symlinks = 0
    for entry in V3.iterdir():
        actual.add(entry.name)
        st = entry.lstat()
        if stat.S_ISLNK(st.st_mode):
            symlinks += 1
        ensure(stat.S_ISREG(st.st_mode) and not stat.S_ISLNK(st.st_mode) and st.st_nlink == 1,
               "bad V3 node " + entry.name)
    ensure(actual == EXPECTED_FILES, "V3 file-set mismatch")
    return {"files": len(actual), "symlinks": symlinks}


def predecessor_check():
    for name, expected in V1_PINS.items():
        ensure(sha(read_bytes(ROOT / name)) == expected, "V1 hash mismatch " + name)
    for name, expected in V2_PINS.items():
        ensure(sha(read_bytes(ROOT / "v2" / name)) == expected, "V2 hash mismatch " + name)
    lineage = load(V3 / "predecessor_lineage.json")
    ensure([p["terminal"] for p in lineage["predecessors"]] == ["NOT_READY", "NOT_READY"], "bad lineage terminals")
    v1 = load(ROOT / "deterministic_preflight_report.json")
    v2 = load(ROOT / "v2/deterministic_preflight_report.json")
    ensure(v1["terminal"] == "NOT_READY" and v1["write_boundary_observation"]["status"] == "fail", "V1 softened")
    ensure(v1["write_boundary_observation"]["confirmed_outside_root_path"] == "/tmp/pm-subcheck-check_shards-98iyebrk.json", "V1 path drift")
    ensure(v2["terminal"] == "NOT_READY" and v2["failed_check_ids"] == ["V2-IO-001"], "V2 softened")
    ensure(v2["checks_passed"] == 0 and v2["checks_blocked"] == 18, "V2 transferred pass")
    b2 = load(ROOT / "v2/boundary_observation.json")
    ensure(b2["observed_outside_root_mutations"] == ["/tmp/v1_hist_extract.txt", "/tmp/v1_surface_extract.txt"], "V2 paths drift")
    ensure(b2["qualifying_checker"]["qualifying_run_performed"] is False, "V2 qualifying run falsified")
    return {"v1_files": 10, "v2_files": 13, "terminals": ["NOT_READY", "NOT_READY"]}


def resolve_binding(binding):
    raw = binding["path"]
    path = Path(raw) if raw.startswith("/") else REPO / raw
    resolved = path.resolve()
    if not raw.startswith("/"):
        ensure(resolved == REPO or REPO in resolved.parents, "repo path escape")
    else:
        allowed = Path("/home/sittingmongoose/.codex/attachments")
        ensure(allowed in resolved.parents, "external path not attachment")
    return resolved


def custody_check():
    custody = load(ROOT / "source_custody.json")
    bindings = custody["hash_bindings"]
    ensure(len(bindings) == 29, "binding count")
    paths = [b["path"] for b in bindings]
    ensure(len(set(paths)) == 29, "duplicate binding path")
    for binding in bindings:
        ensure(sha(read_bytes(resolve_binding(binding))) == binding["sha256"], "binding drift " + binding["path"])
    projection = load(REPO / "Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/current.json")
    ensure(projection["last_event_id"] == "evt-0029" and projection["updated_at_utc"] == "2026-08-13T16:55:00Z", "ledger tuple drift")
    return {"bindings": 29, "matched": 29}


def archive_check():
    custody = load(ROOT / "source_custody.json")
    zpath = Path("/home/sittingmongoose/.codex/attachments/e5971003-fd3c-4394-80e4-ffffac9cbfae/PM_Prompt_Complexity_Final_Course_Correction_2026-08-08.zip")
    zbytes = read_bytes(zpath)
    zbind = next(b for b in custody["hash_bindings"] if b["path"] == str(zpath))
    ensure(sha(zbytes) == zbind["sha256"], "archive hash drift")
    expected = custody["course_correction_archive"]["entry_hashes"]
    ensure(len(expected) == 26, "entry binding count")
    with zipfile.ZipFile(zpath, "r") as zf:
        infos = zf.infolist()
        names = [i.filename for i in infos]
        ensure(len(names) == 26 and len(set(names)) == 26, "ZIP member closure")
        ensure(set(names) == {row["entry"] for row in expected}, "ZIP member set drift")
        for row in expected:
            data = zf.read(row["entry"])
            ensure(len(data) == row["bytes"] and sha(data) == row["sha256"], "ZIP member drift " + row["entry"])
        manifest_name = next(n for n in names if n.endswith("/PACKET_MANIFEST.json"))
        manifest = strict_load_bytes(zf.read(manifest_name))
        rows = manifest.get("files") or manifest.get("entries")
        ensure(isinstance(rows, list) and len(rows) == 25, "manifest rows")
        prefix = manifest_name.rsplit("/", 1)[0] + "/"
        for row in rows:
            rel = row.get("path") or row.get("file") or row.get("entry")
            ensure(isinstance(rel, str) and rel != "PACKET_MANIFEST.json", "bad manifest row")
            entry = prefix + rel
            data = zf.read(entry)
            size = row.get("bytes") if "bytes" in row else row.get("size")
            digest = row.get("sha256")
            ensure(len(data) == size and sha(data) == digest, "manifest mismatch " + rel)
    return {"entries": 26, "manifest_rows": 25, "extracted": False}


def history_data():
    return load(ROOT / "historical_artifact_disposition.json")


def history_closure_check():
    hist = history_data()
    items = hist["items"]
    ensure(len(items) == 59 and len({x["path"] for x in items}) == 59, "historical item closure")
    observed = []
    stack = [HIST]
    while stack:
        directory = stack.pop()
        for entry in sorted(os.scandir(directory), key=lambda value: value.name):
            path = Path(entry.path)
            if path == ROOT:
                continue
            node = entry.stat(follow_symlinks=False)
            ensure(not stat.S_ISLNK(node.st_mode), "historical symlink " + str(path))
            if stat.S_ISDIR(node.st_mode):
                stack.append(path)
            elif stat.S_ISREG(node.st_mode):
                observed.append(path.relative_to(HIST).as_posix())
            else:
                raise ValueError("historical special node " + str(path))
    ensure(set(observed) == {x["path"] for x in items} and len(observed) == 59, "historical filesystem set drift")
    for item in items:
        path = HIST / item["path"]
        ensure(ROOT not in path.resolve().parents and path.resolve() != ROOT, "successor contamination")
        ensure(sha(read_bytes(path)) == item["sha256"], "historical drift " + item["path"])
    return {"items": 59, "observed": len(observed), "matched": 59}


def history_semantic_check():
    hist = history_data()
    counts = {}
    for item in hist["items"]:
        counts[item["disposition"]] = counts.get(item["disposition"], 0) + 1
    ensure(counts == {"reusable": 7, "needs-currentness-refresh": 10,
                      "obsolete/superseded": 25, "preserved-failure-only": 17}, "disposition counts")
    truth = hist["historical_truths_preserved"]
    ensure(truth["terminal"] == "STOPPED_BEFORE_SUBJECT_LAUNCH", "historical terminal")
    ensure(truth["total_subject_model_or_provider_calls"] == 0 and truth["empirical_result"] is False, "historical call truth")
    ensure((truth["surface_rows"], truth["implementation_gated_tests"], truth["semantic_case_drafts"], truth["deterministic_check_drafts"]) == (54, 24, 7, 222), "historical counts")
    ensure(truth["v4_status"] == "V4_PREFREEZE_INVALID", "V4 status")
    return {"counts": counts, "terminal": truth["terminal"]}


def census_check():
    census = load(ROOT / "refreshed_surface_census.json")
    base = load(REPO / "tests/agent_packet_restrictions/inventory/surfaces.v2.json")
    rows = census["rows"]
    base_rows = base.get("surfaces") or base.get("rows")
    ensure(len(rows) == 56 and len(base_rows) == 54, "surface counts")
    ids = [r["surface_id"] for r in rows]
    base_ids = [r["surface_id"] for r in base_rows]
    ensure(len(set(ids)) == 56 and set(ids) - set(base_ids) == {"PROVIDER-001", "RUN-002"}, "surface set")
    counts = {}
    for row in rows:
        c = row["current_testability_class"]
        counts[c] = counts.get(c, 0) + 1
    expected = {"fixed_source_policy_only": 1, "proposed_ledger_only": 2,
                "canonical_plan_only_implementation_gated": 49, "isolated_fixture_only": 2,
                "runnable_current_deterministic": 2}
    ensure(counts == expected and census["counts"]["total_rows"] == 56, "class counts")
    return {"baseline": 54, "rows": 56, "additions": sorted(set(ids) - set(base_ids)), "classes": counts}


def chat_check():
    census = load(ROOT / "refreshed_surface_census.json")
    bounds = census["direct_chat_boundaries"]
    gaps = census["direct_chat_test_gaps"]
    ensure([x["boundary_id"] for x in bounds] == ["CHAT-EX-001", "CHAT-EX-002"], "chat boundaries")
    ensure(len(gaps) == 4 and len(set(gaps)) == 4, "chat gaps")
    v3 = load(V3 / "refreshed_surface_census.json")
    ensure(v3["closed_world_completeness_claimed"] is False, "completeness overclaim")
    return {"boundaries": 2, "gaps": 4, "closed_world_complete": False}


def questions_check():
    source = load(ROOT / "test_design_questions.json")
    projection = load(V3 / "test_design_questions.json")
    expected = ["JQ-%03d" % i for i in range(1, 16)]
    for doc in (source, projection):
        qs = doc["questions"]
        ensure([q["question_id"] for q in qs] == expected, "question IDs")
        for q in qs:
            ensure(q["status"] == "requires_jared_decision" and q["answer"] is None, "question answered")
            ensure(not any(k.startswith("selected") or k in {"default", "recommendation"} for k in q), "selection implied")
    ensure(projection["status"] == "AWAITING_JARED_TEST_PLAN", "question status")
    return {"questions": 15, "answered": 0}


def calls_check():
    docs = [load(V3 / "no_subject_activity.json"), load(ROOT / "deterministic_preflight_report.json"),
            load(ROOT / "v2/no_subject_activity.json")]
    counters = docs[0]["counters"]
    ensure(counters and all(is_int(v) and v == 0 for v in counters.values()), "V3 nonzero or mistyped counter")
    ensure(docs[0]["subject_roster_selected"] is False and docs[0]["test_method_selected"] is False, "V3 selection")
    v1_counts = docs[1]["subject_call_counts"]
    ensure(all(is_int(v) and v == 0 for v in v1_counts.values()), "V1 nonzero or mistyped counter")
    v2_counts = docs[2]["counters"]
    ensure(all(is_int(v) and v == 0 for v in v2_counts.values()), "V2 nonzero or mistyped counter")
    return {"v3_counters": len(counters), "provider_or_model_total": 0}


def capture_digest(record):
    return sha(json_canon(record))


def self_capture_check():
    base = {"path": "a", "size": 1, "sha256": "0" * 64, "authority": "x"}
    d = capture_digest(base)
    variants = []
    for key in base:
        x = dict(base); x[key] = (2 if key == "size" else str(base[key]) + "x"); variants.append(x)
        x = dict(base); del x[key]; variants.append(x)
    x = dict(base); x["extra"] = 1; variants.append(x)
    ensure(all(capture_digest(v) != d for v in variants), "capture mutation undetected")
    ensure(capture_digest({k: base[k] for k in reversed(base)}) == d, "capture order sensitivity")
    return {"mutations_detected": len(variants), "order_invariant": True}


def lineage_digest(edges):
    keys = [json_canon(e) for e in edges]
    ensure(len(keys) == len(set(keys)), "duplicate lineage edge")
    return sha(b"\n".join(sorted(keys)))


def self_lineage_check():
    edges = [{"source": "a", "target": "b", "relation": "uses", "sha256": "1" * 64},
             {"source": "b", "target": "c", "relation": "derives", "sha256": "2" * 64}]
    d = lineage_digest(edges)
    ensure(lineage_digest(list(reversed(edges))) == d, "lineage order")
    muts = []
    for i in range(len(edges)):
        for field in edges[i]:
            x = [dict(e) for e in edges]; x[i][field] = str(x[i][field]) + "x"; muts.append(x)
    ensure(all(lineage_digest(x) != d for x in muts), "lineage mutation")
    try:
        lineage_digest(edges + [dict(edges[0])])
    except ValueError:
        pass
    else:
        raise ValueError("duplicate lineage accepted")
    return {"mutations_detected": len(muts), "duplicate_rejected": True, "order_invariant": True}


def score(reqs, evidence):
    ensure(len(reqs) == len(set(reqs)), "duplicate requirement")
    ensure(set(evidence) == set(reqs), "requirement/evidence closure")
    ensure(all(evidence[r] in {"pass", "fail", "uncertain"} for r in reqs), "bad disposition")
    return "pass" if all(evidence[r] == "pass" for r in reqs) else "not_pass"


def self_score_check():
    ensure(score(["a", "b"], {"a": "pass", "b": "pass"}) == "pass", "positive scorer")
    ensure(score(["b", "a"], {"b": "pass", "a": "pass"}) == "pass", "order scorer")
    for reqs, evidence in [(["a", "a"], {"a": "pass"}), (["a"], {}), (["a"], {"a": "pass", "b": "pass"}), (["a"], {"a": "unknown"})]:
        try:
            score(reqs, evidence)
        except ValueError:
            pass
        else:
            raise ValueError("scorer accepted invalid case")
    return {"negative_cases": 4, "order_invariant": True}


def terminal_check():
    statuses = ["pass"] * 18
    derive = lambda xs: "READY_FOR_JARED_TEST_PLAN" if all(x == "pass" for x in xs) else "NOT_READY"
    ensure(derive(statuses) == "READY_FOR_JARED_TEST_PLAN", "all-pass reducer")
    for i in range(len(statuses)):
        for bad in ("fail", "blocked"):
            x = list(statuses); x[i] = bad
            ensure(derive(x) == "NOT_READY", "single-failure reducer")
    ensure(derive(list(reversed(statuses))) == "READY_FOR_JARED_TEST_PLAN", "reducer order")
    return {"single_mutations": 36, "report_input": False}


def io_check():
    changed = []
    for raw_path, before in READS.items():
        path = Path(raw_path)
        st = path.lstat()
        now = (sha(path.read_bytes()), st.st_size, st.st_mode, st.st_mtime_ns)
        if now != before:
            changed.append(raw_path)
    ensure(not changed, "read-universe drift: " + ",".join(changed))
    ensure(all(v == 0 for v in AUDIT.values()), "forbidden audit attempt")
    return {"read_universe_files": len(READS), "changed": 0, "audit": dict(AUDIT)}


def boundary_check():
    boundary = load(V3 / "boundary_observation.json")
    before = boundary["outside_successor_snapshot_before"]
    after = boundary["outside_successor_snapshot_after"]
    ensure(boundary["status"] == "pass" and boundary["unchanged"] is True, "boundary not finalized")
    ensure(before == after, "outside snapshot changed")
    ensure(boundary["shell_redirections"] == 0 and boundary["temporary_files"] == 0, "controller temp/redirection")
    ensure(boundary["recursive_v3_symlink_count"] == 0 and boundary["v1_v2_lineage_files_unchanged"] is True, "lineage/root boundary")
    q = boundary["qualifying_checker"]
    ensure(q["stdout_regular_file"] is False and q["stderr_bytes"] == 0 and q["filesystem_mutations"] == 0,
           "checker IO observation")
    ensure(q["subprocesses"] == 0 and q["network_operations"] == 0 and q["audit_hook_forbidden_attempts"] == 0,
           "checker forbidden observation")
    return {"outside_digest": before["sha256"], "unchanged": True, "symlinks": 0}


def report_check(core_results):
    projection = load(V3 / "deterministic_preflight_report.json")
    readiness = read_bytes(V3 / "readiness_report.md").decode("utf-8")
    core_failed = [r["check_id"] for r in core_results if r["status"] != "pass"]
    terminal = "READY_FOR_JARED_TEST_PLAN" if not core_failed else "NOT_READY"
    ensure(projection["projection_kind"] == "predeclared_projection_not_run_receipt", "projection kind")
    ensure(projection["projected_terminal"] == terminal, "projection terminal")
    ensure(projection["projected_check_ids"] == list(CHECK_IDS), "projected check IDs")
    ensure(projection["projected_checks_total"] == 19 and projection["projected_checks_passed"] == 19,
           "projected totals")
    ensure(projection["projected_checks_failed"] == 0 and projection["projected_checks_blocked"] == 0,
           "projected failures")
    ensure(all(value is False for value in projection["claim_boundary"].values()), "projection overclaim")
    ensure("predeclared projection, not a run receipt" in readiness and "READY_FOR_JARED_TEST_PLAN" in readiness,
           "readiness projection text")
    ensure("provide the exact models to test and how you want them tested" in readiness, "missing Jared stop")
    return {"derived_terminal": terminal, "projection_agrees": True, "authoritative_result": "stdout"}


def emit(payload):
    sys.stdout.write(json.dumps(payload, sort_keys=True, separators=(",", ":"), allow_nan=False) + "\n")
    sys.stdout.flush()


def main():
    for name in sorted(EXPECTED_FILES):
        read_bytes(V3 / name)
    funcs = (
        ("V3-CTL-001", ctl_check), ("V3-JSON-001", json_check), ("V3-ROOT-001", root_check),
        ("V3-PRED-001", predecessor_check), ("V3-CUST-001", custody_check), ("V3-ARC-001", archive_check),
        ("V3-HIST-001", history_closure_check), ("V3-HIST-002", history_semantic_check),
        ("V3-CENSUS-001", census_check), ("V3-CHAT-001", chat_check),
        ("V3-JARED-001", questions_check), ("V3-CALL-001", calls_check),
        ("V3-SELF-001", self_capture_check), ("V3-SELF-002", self_lineage_check),
        ("V3-SELF-003", self_score_check), ("V3-TERM-001", terminal_check),
    )
    results = [check(cid, fn) for cid, fn in funcs]
    results.append(check("V3-IO-001", io_check))
    results.append(check("V3-BOUNDARY-001", boundary_check))
    results.append(check("V3-REPORT-001", lambda: report_check(tuple(results))))
    failed = [r["check_id"] for r in results if r["status"] != "pass"]
    terminal = "READY_FOR_JARED_TEST_PLAN" if not failed else "NOT_READY"
    payload = {"schema_id": "pm.prompt_complexity_successor.qualifying_stdout.v3",
               "attempt_id": "successor-preflight-20260813-v3", "run_id": "successor-preflight-20260813-v3-run-001",
               "terminal": terminal, "checks_total": len(results), "checks_passed": len(results) - len(failed),
               "checks_failed": len(failed), "failed_check_ids": failed, "subject_model_or_provider_calls": 0,
               "subject_roster_selected": False, "test_method_selected": False, "results": results,
               "next_action": "Stop and ask Jared for exact models and testing method." if not failed else "Preserve failure."}
    emit(payload)
    return 0 if not failed else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception as exc:
        emit({"schema_id": "pm.prompt_complexity_successor.qualifying_stdout.v3",
              "attempt_id": "successor-preflight-20260813-v3", "terminal": "NOT_READY",
              "execution_status": "checker_error", "error": type(exc).__name__ + ": " + str(exc),
              "subject_model_or_provider_calls": 0})
        raise SystemExit(2)
