#!/usr/bin/env python3
"""Static checker for Plans/goal_current_writer_oracle_fixtures.json (ATS-210, DL-045 depth, 2026-11-04).

Five current Goal writers: goal.updated, goal.cancelled, goal_run.started, goal_run.cancelled and
goal_run.certified. The checker validates payload cases against the registered v3 payload schemas,
recomputes the SP-421/SP-422 identity recipes, walks the SP-299 progress edges, applies the Storage
dedupe rule, checks the SP-310 late-assignment rule (only sequence_id is assigned late) and runs a
pure model of the SP-311, SP-312 and GRS-085 projector rule tables over abstract row sequences.
It proves owner-text consistency only; native execution stays NOT_RUN. Exit 0 on full agreement.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

try:
    import jsonschema
    from pm_goal_oracle_common import (Audit, Gates, FORMATS, StrictValidator, schema_registry,
        append_result, append_guards, print_result, load, validator)
except ImportError as exc:  # pragma: no cover
    print(json.dumps({"status": "error", "reason": f"missing dependency: {exc}"}))
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "Plans/goal_current_writer_oracle_fixtures.json"
DOMAINS = {"goal.updated": "pm.goal.updated.command.v1", "goal.cancelled": "pm.goal.cancelled.command.v1"}
COMMANDS = {"goal.updated": "cmd.chat.goal.update", "goal.cancelled": "cmd.chat.goal.cancel"}
CURRENT_SCHEMA = {
    "goal.updated": "pm.goal_runtime_event.goal_updated.schema.v3",
    "goal.cancelled": "pm.goal_runtime_event.goal_cancelled.schema.v3",
}
S, C, CE = "goal_run.started", "goal_run.cancelled", "goal_run.certified"

FORMAT_CHECKER = FORMATS

def jcs_strings(values: list[str]) -> bytes:
    # RFC 8785 for an array of strings: compact separators, literal UTF-8, standard JSON escapes.
    return json.dumps(values, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def recipe(family: str, inputs: dict) -> tuple[str, str]:
    order = ["storage_instance_id", "project_id", "thread_id", "command_id", "command_instance_id", "operation_id", "goal_id"]
    digest = hashlib.sha256(jcs_strings([DOMAINS[family], "project"] + [inputs[k] for k in order])).hexdigest()
    return f"{family}.v1:{digest}", f"{family}.command.v1:{digest}"


def walk(sequence, edges, disabled=(), trace=False):
    g=Gates(disabled)
    g.require('progress/source',bool(sequence) and sequence[0]=='source_admitted')
    g.require('progress/edge',all((a,b) in {tuple(e) for e in edges} for a,b in zip(sequence,sequence[1:])))
    return g.errors if trace else not g.errors


def dedupe(case: dict, disabled=()) -> str:
    return append_result(case, disabled)


def late_guards(case, disabled=()):
    g = Gates(disabled)
    t, fin = case['template'], case['final']
    g.require('late/key_set', set(fin) == set(t))
    for k in t:
        if k != 'sequence_id':
            g.require('late/value/' + k, fin.get(k) == t[k])
    g.require('late/sequence', type(fin.get('sequence_id')) is int and fin['sequence_id'] >= 0)
    return g.errors


def reduce_rows(rows, mode, disabled=(), trace=False):
    supported={'started':{S},'cancelled':{S,C},'certified':{S,C,CE}}[mode]
    row=None;keys={};g=Gates(disabled)
    def refuse(outcome,index):
        return g.errors if trace else {'outcome':outcome,'index':index,'row':row}
    for i,r in enumerate(rows):
        g.require('reducer/verified',r.get('verified',False) is True)
        g.require('reducer/scope',r.get('scope_mismatch',False) is False)
        if g.errors:return refuse('halt_before',i)
        if r['run']!='this':continue
        ev,key=r['event_type'],r['event_key']
        g.require('reducer/'+mode+'/supported',ev in supported)
        if g.errors:return refuse('halt_before',i)
        if ev not in supported:continue
        if ev==S:
            g.require('reducer/'+mode+'/single_start',row is None)
            if g.errors:
                if keys.get(S)==key:return refuse('coverage_failure',i)
                if mode=='cancelled' and row==C:return refuse('refused',i)
                if mode=='certified' and row in (C,CE):return refuse('halt_before',i)
                return refuse('custody_mismatch',i)
            if row is None:row,keys[S]=S,key
        elif ev==C:
            g.require('reducer/'+mode+'/cancel_edge',row not in (C,CE) and (mode!='certified' or row is not None))
            if g.errors:return refuse('refused' if mode=='cancelled' else 'halt_before',i)
            row,keys[C]=C,key
        elif ev==CE:
            g.require('reducer/certified/certify_edge',row==S)
            if g.errors:return refuse('halt_before',i)
            row,keys[CE]=CE,key
    return g.errors if trace else {'outcome':'advanced','row':row}


def main() -> int:
    doc = json.loads(FIXTURES.read_text(encoding="utf-8"))
    failures: list[str] = []
    counts: dict[str, int] = {}

    def check(cond: bool, label: str) -> None:
        counts[label.split(":")[0]] = counts.get(label.split(":")[0], 0) + 1
        if not cond:
            failures.append(label)

    fams = doc["families"]
    audit = Audit()
    schema_registry([ROOT / f["payload_schema"] for f in fams.values() if "payload_schema" in f])
    for family in ("goal.updated", "goal.cancelled"):
        f = fams[family]
        schema = json.loads((ROOT / f["payload_schema"]).read_text(encoding="utf-8"))
        v = validator(schema)
        for case in f["payload_cases"]:
            check((not list(v.iter_errors(case["value"]))) == case["valid"], f"{family} payload:{case['id']}")
            def payload(value, disabled, v=v, family=family):
                g=Gates(disabled);g.schema(v,value,family+'/payload');return g.errors
            audit.case(family+'/payload/'+case['id'],payload,case['value'],case['valid'])
        seen: dict[str, tuple] = {}
        for case in f["identity_cases"]:
            ev, key = recipe(family, case["inputs"])
            ok = case["inputs"]["command_id"] == COMMANDS[family] and case["event_id"] == ev and case["idempotency_key"] == key
            check(ok == case["valid"], f"{family} identity:{case['id']}")
            def identity(value,disabled,family=family):
                g=Gates(disabled);ev,key=recipe(family,value['inputs'])
                g.require('identity/'+family+'/command',value['inputs']['command_id']==COMMANDS[family])
                g.require('identity/'+family+'/event',value['event_id']==ev)
                g.require('identity/'+family+'/key',value['idempotency_key']==key)
                return g.errors
            audit.case(family+'/identity/'+case['id'],identity,case,case['valid'])
            if ok:
                inp = tuple(sorted(case["inputs"].items()))
                prior = seen.get(ev)
                check(prior is None or prior == inp, f"{family} identity-collision:{case['id']}")
                seen[ev] = inp

    up = fams["goal.updated"]
    for case in up["progress_cases"]:
        check(walk(case["sequence"], up["progress_edges"]) == case["valid"], f"goal.updated progress:{case['id']}")
        audit.case('goal.updated/progress/'+case['id'],lambda value,disabled:walk(value,up['progress_edges'],disabled,True),case['sequence'],case['valid'])
    for case in up["reader_cases"]:
        got = "observation" if case["payload_schema_id"] == CURRENT_SCHEMA["goal.updated"] else "unsupported_payload"
        check(got == case["expected"], f"goal.updated reader:{case['id']}")
    ca = fams["goal.cancelled"]
    for case in ca["payload_join_cases"]:
        n, p = case["normalized"], case["payload"]
        ok = (p["operation_id"] == n["operation_id"] == p["cancellation_id"]
              and p["command_instance_id"] == n["command_instance_id"] and p["goal_id"] == n["goal_id"])
        check(ok == case["valid"], f"goal.cancelled join:{case['id']}")
        def joined(value,disabled):
            g=Gates(disabled);n,p=value['normalized'],value['payload']
            for field in ('operation_id','command_instance_id','goal_id'):
                g.require('cancel_join/'+field,n[field]==p[field])
            g.require('cancel_join/cancellation_id',p['operation_id']==p['cancellation_id'])
            return g.errors
        audit.case('goal.cancelled/join/'+case['id'],joined,case,case['valid'])
    for case in ca["late_assignment_cases"]:
        t, fin = case["template"], case["final"]
        ok = not late_guards(case)
        check(ok == case["valid"], f"goal.cancelled late:{case['id']}")
        audit.case('goal.cancelled/late/'+case['id'],late_guards,case,case['valid'])
    for case in ca["inspection_cases"]:
        got = "observation" if case["payload_schema_id"] == CURRENT_SCHEMA["goal.cancelled"] else "unsupported_payload"
        check(got == case["expected"], f"goal.cancelled inspect:{case['id']}")
    for family, mode in ((S, "started"), (C, "cancelled"), (CE, "certified")):
        f = fams[family]
        v = validator(load(ROOT / f['payload_schema']))
        for case in f['payload_cases']:
            check((not list(v.iter_errors(case['value']))) == case['valid'], family+'/payload:'+case['id'])
            def payload(value, disabled, v=v, family=family):
                g=Gates(disabled);g.schema(v,value,family+'/payload');return g.errors
            audit.case(family+'/payload/'+case['id'],payload,case['value'],case['valid'])
        for case in fams[family]["reducer_cases"]:
            got = reduce_rows(case["rows"], mode)
            exp = case["expected"]
            same = got["outcome"] == exp["outcome"] and got.get("row") == exp.get("row") and got.get("index") == exp.get("index")
            check(same, f"{family} reducer:{case['id']} got {got}")
            audit.case(family+'/reducer/'+case['id'],lambda value,disabled,mode=mode:reduce_rows(value,mode,disabled,True),case['rows'],exp['outcome']=='advanced')
    for family, f in fams.items():
        for case in f['replay_cases']:
            check(dedupe(case) == case['expected'],family+'/replay:'+case['id'])
            audit.case(family+'/replay/'+case['id'],append_guards,case,case['expected'] in ('append_new','return_original_receipt'))
        for case in f['protocol_cases']:
            def protocol(value, disabled):
                g=Gates(disabled)
                g.require('append/replay_policy',value['event']['replay_policy']!='projector_replay_only')
                g.require('append/admission',value['admitted'] is True)
                return g.errors
            audit.case(family+'/append/'+case['id'],protocol,case['input'],case['valid'])
    result=audit.run()
    result['failures'].extend(failures)
    result['status']='fail' if result['failures'] else 'pass'
    result['case_counts']=counts
    return print_result(result,sys.argv)



if __name__ == "__main__":
    sys.exit(main())
