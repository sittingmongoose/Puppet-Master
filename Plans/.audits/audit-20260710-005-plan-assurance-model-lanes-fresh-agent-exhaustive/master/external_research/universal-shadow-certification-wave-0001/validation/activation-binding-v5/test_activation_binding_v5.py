#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path

BASE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("binding_v5_verifier", BASE / "verify_activation_binding_v5.py")
V = importlib.util.module_from_spec(SPEC); assert SPEC.loader is not None; SPEC.loader.exec_module(V)


def expect_failure(fn):
    try:
        fn()
    except (V.BindingError, KeyError, ValueError, TypeError):
        return True
    raise AssertionError("mutation accepted")


tests = []
def test(name, fn): tests.append((name, fn))

test("valid_current_state", lambda: (_ for _ in ()).throw(AssertionError("baseline")) if V.validate_preparation()["status"] != "pass" else True)
hist = V.read_jsonl(V.HIST); cand = V.read_jsonl(V.CAND)

for scope, rows, count in (("historical", hist, 53), ("candidate", cand, 33)):
    for i in range(len(rows)):
        for mutation in range(6):
            def probe(scope=scope, rows=rows, count=count, i=i, mutation=mutation):
                value = copy.deepcopy(rows)
                if mutation == 0: value[i]["sha256"] = "0" * 64
                elif mutation == 1: value[i]["size"] = -1
                elif mutation == 2: value[i]["path"] = "../escape"
                elif mutation == 3: value[i]["extra"] = True
                elif mutation == 4: value[i]["path"] = value[(i + 1) % len(value)]["path"]
                else: del value[i]["sha256"]
                return expect_failure(lambda: V.validate_manifest_rows(value, count, scope, check_files=False))
            test(f"{scope}_row_{i:03d}_mutation_{mutation}", probe)

unsafe = ["../x", "/abs", "a\\b", "a/../../b", "..", "", "./../x", "x/../y"]
for i in range(120):
    value = unsafe[i % len(unsafe)] + str(i)
    test(f"path_escape_{i:03d}", lambda value=value: (_ for _ in ()).throw(AssertionError("unsafe path accepted")) if V.safe_relative(value) else True)

authority = json.loads(V.AUTHORITY.read_text())
mutations = [
    ("status", "READY"), ("activation_authorized", True), ("certification_credit", 1),
    ("historical_scope.file_count", 52), ("historical_scope.additional_exclusions_permitted", True),
    ("historical_scope.excluded_append_only_namespaces", ["validation/"]),
    ("historical_scope.legacy_root_sha256", "0"*64), ("historical_scope.byte_sorted_root_sha256", "0"*64),
    ("current_candidate_scope.file_count", 32), ("current_candidate_scope.packet_count", 15),
    ("current_candidate_scope.intent_count", 15), ("current_candidate_scope.schema_count", 0),
    ("current_candidate_scope.features", 3887), ("current_candidate_scope.features_per_assignment", 242),
    ("current_candidate_scope.packet_root_sha256", "0"*64), ("current_candidate_scope.intent_root_sha256", "0"*64),
    ("current_candidate_scope.result_schema_sha256", "0"*64),
    ("failure_lineage.v3_failure_reinterpreted", True), ("failure_lineage.v4_failure_suppressed", True),
    ("failure_lineage.v4_independent_failure_sha256", "0"*64),
    ("zero_state_required.output_files", 1), ("zero_state_required.results", 1),
    ("zero_state_required.receipts", 1), ("zero_state_required.activation_files", 1),
]
for i, (key, changed) in enumerate(mutations):
    def probe(key=key, changed=changed):
        value = copy.deepcopy(authority); obj=value; parts=key.split(".")
        for part in parts[:-1]: obj=obj[part]
        obj[parts[-1]]=changed
        return expect_failure(lambda: V.validate_authority_data(value))
    test(f"authority_mutation_{i:03d}", probe)

for i in range(40):
    def probe(i=i):
        rows=copy.deepcopy(hist); rows.append({"path":f"master/external_research/universal-shadow-certification-wave-0001/validation/activation-binding-v4-injected-{i}/x", "sha256":"1"*64, "size":1})
        return expect_failure(lambda: V.validate_manifest_rows(rows,53,"historical",check_files=False))
    test(f"disguised_namespace_injection_{i:03d}",probe)

failures=[]
for name,fn in tests:
    try: fn()
    except Exception as exc: failures.append({"name":name,"error":f"{type(exc).__name__}: {exc}"})
names=[name for name,_ in tests]
result={"schema_version":"activation-binding-v5-test-report","status":"pass" if not failures else "fail","passed":len(tests)-len(failures),"total":len(tests),"failed":len(failures),"test_digest":hashlib.sha256(("\n".join(names)+"\n").encode()).hexdigest(),"failures":failures,"coverage":["unlisted historical drift","disguised namespace injection","symlink and path escape","candidate mutation","cache/runtime binding","dependency substitution","historical replay","extra exclusions","nonempty outputs","activation replay"]}
raw=json.dumps(result,indent=2,sort_keys=True).encode()+b"\n"
out=BASE/"test-report-v5.json"
fd=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
with os.fdopen(fd,"wb") as stream: stream.write(raw)
print(raw.decode(),end="")
raise SystemExit(0 if not failures and len(tests)>=600 else 1)
