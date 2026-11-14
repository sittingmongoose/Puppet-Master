#!/usr/bin/env python3
"""Static checker for Plans/goal_run_stop_block_oracle_fixtures.json (ATS-212; DL-080 under DL-045, 2026-11-04).

goal_run.stopped and goal_run.blocked v3: payload cases against the prepared v3 schemas, SP-426/SP-427
identity recipes, D-R21/D-R16 source-status tables, EP-200 wiring expectations and the GRS-202
projection rule table. Static consistency only; the writers are not installable on any existing
birth and every native obligation stays NOT_RUN. Exit 0 on full agreement.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

try:
    import jsonschema
    from pm_goal_oracle_common import Audit, Gates, FORMATS, StrictValidator, schema_registry, print_result, load, append_result, append_guards, sha, validator, revision_text, integer_number
except ImportError as exc:  # pragma: no cover
    print(json.dumps({"status": "error", "reason": f"missing dependency: {exc}"}))
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "Plans/goal_run_stop_block_oracle_fixtures.json"
DOMAINS = {"goal_run.stopped": "pm.goal_run.stopped.v1", "goal_run.blocked": "pm.goal_run.blocked.v1"}
LEGAL = {
    # D-R21 and D-R16 source statuses over the native Workflow status set.
    "goal_run.stopped": {"ready", "running", "provisional_success", "verifying", "failed_verification", "repairing", "blocked", "stopped"},
    "goal_run.blocked": {"ready", "running", "provisional_success", "verifying", "failed_verification", "repairing", "blocked"},
}
SELF = {"goal_run.stopped": "stopped", "goal_run.blocked": "blocked"}
WRITERS = {
    ("cmd.orchestrator.pause", "goal_run.stopped"): "owner.executor.workflow_run.stop.v1",
    ("cmd.runtime.abort_run", "goal_run.stopped"): "owner.executor.workflow_run.stop.v1",
    (None, "goal_run.blocked"): "owner.executor.workflow_run.block.v1",
}
FORMAT_CHECKER = FORMATS

def recipe(family: str, inputs: dict) -> tuple[str, str]:
    order = ["storage_instance_id", "project_id", "goal_id", "goal_run_id", "expected_goal_run_revision", "operation_id"]
    vals = [revision_text(inputs[k]) if k == "expected_goal_run_revision" else inputs[k] for k in order]
    blob = json.dumps([DOMAINS[family], "project"] + vals, separators=(",", ":"), ensure_ascii=False).encode()
    digest = hashlib.sha256(blob).hexdigest()
    return f"{family}.v1:{digest}", f"{family}.writer.v1:{digest}"


EDGES = {
    ("started", "goal_run.blocked"), ("started", "goal_run.stopped"), ("started", "goal_run.cancelled"), ("started", "goal_run.certified"),
    ("blocked", "goal_run.blocked"), ("blocked", "goal_run.stopped"), ("blocked", "goal_run.cancelled"),
    ("stopped", "goal_run.stopped"), ("stopped", "goal_run.cancelled"),
}


def project(rows: list[dict], birth, disabled=(), *, trace=False):
    status, rev = None, None
    g=Gates(disabled)
    for i,r in enumerate(rows):
        ev=r['event_type']
        g.require('projection/verified',r['verified'] is True)
        g.require('projection/source_edition',r['source_edition']==birth['source_edition'])
        g.require('projection/source_digest',r['birth_source_digest']==sha(birth['descriptor']))
        g.require('projection/storage',r['storage_instance_id']==birth['storage_instance_id'])
        g.require('projection/checkpoint_storage',r['checkpoint_storage_instance_id']==r['storage_instance_id'])
        stop_block=ev in ('goal_run.blocked','goal_run.stopped')
        if stop_block:
            writer='owner.executor.workflow_run.'+('stop.v1' if ev.endswith('stopped') else 'block.v1')
            g.require('projection/source_admission',birth['admission']=='admitted_original')
            g.require('projection/installed_writer',writer in birth['descriptor']['installed_writers'])
            g.require('projection/profile',r['profile']==birth['descriptor']['profile'])
            g.require('projection/payload_major',r['payload_major']==3)
            g.require('projection/evidence',isinstance(r['evidence_refs'],list) and bool(r['evidence_refs']) and all(isinstance(ref,str) and bool(ref) for ref in r['evidence_refs']))
        if status is None:
            g.require('projection/first_started',integer_number(r['goal_run_revision']) and ev=='goal_run.started')
        else:
            g.require('projection/edge', (status,ev) in EDGES)
            g.require('projection/expected_revision',integer_number(r['expected_goal_run_revision']) and r['expected_goal_run_revision']==rev)
            if not g.errors:
                g.require('projection/revision_step',integer_number(r['goal_run_revision']) and r['goal_run_revision']==r['expected_goal_run_revision']+1)
            if status==ev.split('.',1)[1] and stop_block:
                g.require('projection/new_evidence',r['evidence_refs']!=rows[i-1]['evidence_refs'])
        if g.errors:
            result={'outcome':'halt_before','index':i,'status':status,'revision':rev}
            return g.errors if trace else result
        status,rev=ev.split('.',1)[1],r['goal_run_revision']
    return g.errors if trace else {'outcome':'advanced','status':status,'revision':rev}


def payload_semantics(family,value,disabled=()):
    g=Gates(disabled)
    _,key=recipe(family,{'storage_instance_id':'00000000-0000-4000-8000-000000000001',
        'project_id':value['project_id'],'goal_id':value['goal_id'],'goal_run_id':value['payload']['goal_run_id'],
        'expected_goal_run_revision':value['expected_goal_run_revision'],
        'operation_id':'op:pause:1' if family=='goal_run.stopped' else 'op:block:1'})
    g.require('payload/'+family+'/idempotency_recipe',value['idempotency_key']==key)
    g.require('payload/'+family+'/revision_step',value['goal_run_revision']==value['expected_goal_run_revision']+1)
    return g.errors

def main() -> int:
    doc = json.loads(FIXTURES.read_text(encoding="utf-8"))
    failures: list[str] = []
    audit=Audit()
    schema_registry([ROOT/f["payload_schema"] for f in doc["families"].values()])
    counts: dict[str, int] = {}

    def check(ok: bool, label: str) -> None:
        key = label.split(":")[0]
        counts[key] = counts.get(key, 0) + 1
        if not ok:
            failures.append(label)

    for family, f in doc["families"].items():
        v = validator(json.loads((ROOT / f["payload_schema"]).read_text(encoding="utf-8")))
        for case in f["payload_cases"]:
            valid = not list(v.iter_errors(case["value"]))
            if valid:
                ev, key = recipe(family, {"storage_instance_id": "00000000-0000-4000-8000-000000000001", "project_id": case["value"]["project_id"],
                                          "goal_id": case["value"]["goal_id"], "goal_run_id": case["value"]["payload"]["goal_run_id"],
                                          "expected_goal_run_revision": case["value"]["expected_goal_run_revision"],
                                          "operation_id": "op:pause:1" if family == "goal_run.stopped" else "op:block:1"})
                valid = case["value"]["idempotency_key"] == key and case["value"]["goal_run_revision"] == case["value"]["expected_goal_run_revision"] + 1
            check(valid == case["valid"], f"{family} payload:{case['id']}")
            def payload(value,disabled,v=v,family=family):
                g=Gates(disabled);g.schema(v,value,family+'/payload');return g.errors
            audit.case(family+'/payload/'+case['id'],payload,case['value'],case['valid'])
        for case in f['semantic_payload_cases']:
            audit.case(family+'/payload_semantics/'+case['id'],lambda value,disabled,family=family:payload_semantics(family,value,disabled),case['value'],case['valid'])
        for case in f["identity_cases"]:
            ev, key = recipe(family, case["inputs"])
            check((case["event_id"] == ev and case["idempotency_key"] == key) == case["valid"], f"{family} identity:{case['id']}")
            def identity(value,disabled,family=family):
                g=Gates(disabled);event,key=recipe(family,value['inputs'])
                g.require('identity/'+family+'/event',value['event_id']==event)
                g.require('identity/'+family+'/key',value['idempotency_key']==key)
                return g.errors
            audit.case(family+'/identity/'+case['id'],identity,case,case['valid'])
        for case in f["source_status_cases"]:
            s = case["source_status"]
            legal = s in LEGAL[family] and (s != SELF[family] or case["new_evidence"] is True)
            check(legal == case["legal"], f"{family} source:{case['id']}")
            def source(value,disabled,family=family):
                g=Gates(disabled)
                g.require('source/'+family+'/status',value['source_status'] in LEGAL[family])
                if value['source_status']==SELF[family]:g.require('source/'+family+'/new_evidence',value['new_evidence'] is True)
                return g.errors
            audit.case(family+'/source/'+case['id'],source,case,case['legal'])
    for case in doc["wiring_cases"]:
        got = WRITERS.get((case["command_id"], case["family"]))
        check(got == case["writer"], f"wiring:{case['id']}")
    for case in doc["projection_cases"]:
        got = project(case["rows"], case["birth"])
        exp = case["expected"]
        same = all(got.get(k) == exp.get(k) for k in ("outcome", "index", "status", "revision"))
        check(same, f"projection:{case['id']} got {got}")
        def projection(value,disabled):return project(value['rows'],value['birth'],disabled,trace=True)
        audit.case('projection/'+case['id'],projection,case,exp['outcome']=='advanced')
    for family,f in doc['families'].items():
        for case in f['replay_cases']:
            check(append_result(case)==case['expected'],family+'/replay:'+case['id'])
            audit.case(family+'/replay/'+case['id'],append_guards,case,case['expected'] in ('append_new','return_original_receipt'))
        for case in f['protocol_cases']:
            def protocol(value,disabled):
                g=Gates(disabled)
                g.require('append/replay_policy',value['event']['replay_policy']!='projector_replay_only')
                g.require('append/admission',value['admitted'] is True)
                return g.errors
            audit.case(family+'/append/'+case['id'],protocol,case['input'],case['valid'])
    result=audit.run();result['failures'].extend(failures)
    result['status']='fail' if result['failures'] else 'pass'
    result['case_counts']=counts
    return print_result(result,sys.argv)



if __name__ == "__main__":
    sys.exit(main())
