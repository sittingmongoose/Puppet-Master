#!/usr/bin/env python3
"""DR causal guard-removal matrix. Every mutation is in memory, then discarded.

Pairs run at their named validation boundary. Compound guards name the complete
rule; repeated enforcement sites of the SAME rule are removed together and are
listed explicitly. Pack digest and successor ordinal are separate single-leaf
mutations. No fixture answer, source file, or production guard is weakened.
"""
import argparse
import ast
import contextlib
import hashlib
import io
import json
from pathlib import Path
import sys
import types

from pm_runtime_artifact_guard_cases import accepted, cases

ROOT=Path(__file__).resolve().parents[1]
CHECKER=ROOT/'scripts/pm-runtime-artifact-event-drafts.py'
VALIDATION_CACHE={}


def module(source,references=None):
    m=types.ModuleType('dr_guard_trial');m.__file__=str(CHECKER)
    exec(compile(source,str(CHECKER),'exec'),m.__dict__)
    # Schemas/fixture inputs are immutable in these trials. This only avoids
    # repeated filesystem reads, without caching validation or expected answers.
    raw=m.load;cache={}
    def load(path):
        if path not in cache:cache[path]=raw(path)
        return cache[path]
    m.load=load
    tree=ast.parse(source)
    lexical=hashlib.sha256(''.join(ast.get_source_segment(source,n) for n in tree.body
        if isinstance(n,ast.FunctionDef) and n.name in ('exact_pattern','exact_pattern_properties')).encode()).hexdigest()
    class MemoValidator:
        """Pure schema evaluation cached by exact code/schema/instance bytes.

        Mutated schema/lexical code always gets a distinct key. No domain guard,
        mutation outcome, fixture expectation or main() result is cached.
        """
        def __init__(self,raw):
            self.raw=raw;self.schema=raw.schema
            self.key=(lexical,type(raw).__name__,json.dumps(self.schema,sort_keys=True))
        def iter_errors(self,instance):
            key=(self.key,json.dumps(instance,sort_keys=True))
            if key not in VALIDATION_CACHE:
                VALIDATION_CACHE[key]=tuple(self.raw.iter_errors(instance))
            return iter(VALIDATION_CACHE[key])
        def is_valid(self,instance):return not tuple(self.iter_errors(instance))
    raw_validator=m.validator;validators={};schemas=[]
    def cached_validator(schema,definition=None,**kwargs):
        key=(id(schema),definition,tuple(sorted(kwargs.items())))
        if key not in validators:
            schemas.append(schema)
            validators[key]=MemoValidator(raw_validator(schema,definition,**kwargs))
        return validators[key]
    m.validator=cached_validator
    for name in ('EVENT_VALIDATOR','RECEIPT_VALIDATOR','CUSTODY_VALIDATOR','RESULT_VALIDATOR'):
        setattr(m,name,MemoValidator(getattr(m,name)))
    m._raw_SchemaReferences=m.SchemaReferences
    if references is None:
        references=m.SchemaReferences()
        raw_errors=references.errors;answers={}
        def errors(paths,overrides=None):
            key=(tuple(paths),json.dumps(overrides,sort_keys=True))
            if key not in answers:answers[key]=raw_errors(paths,overrides)
            return answers[key]
        references.errors=errors
    m.SchemaReferences=lambda:references
    return m


def replace(source,function,old,new):
    tree=ast.parse(source)
    node=next(n for n in ast.walk(tree) if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)) and n.name==function)
    lines=source.splitlines(keepends=True);body=''.join(lines[node.lineno-1:node.end_lineno])
    if body.count(old)!=1:raise ValueError((function,old,body.count(old)))
    return ''.join(lines[:node.lineno-1])+body.replace(old,new)+''.join(lines[node.end_lineno:])


def condition(source,function,contains):
    """Remove a complete refusal condition at one named boundary."""
    tree=ast.parse(source);fn=next(n for n in ast.walk(tree) if isinstance(n,ast.FunctionDef) and n.name==function)
    matches=[n.test for n in ast.walk(fn) if isinstance(n,ast.If) and contains in ast.get_source_segment(source,n.test)]
    if len(matches)!=1:raise ValueError((function,contains,len(matches)))
    old=ast.get_source_segment(source,matches[0])
    return replace(source,function,old,'False')


# id -> (boundary/rule, transformations). Every full refusal block and final
# predicate in decode/inspect/full_value/stored/append/policies/checkpoint/
# observation is represented. Forwarded schema/decode/full_value calls reuse
# the callee's row; routing/type dispatch and exception adapters add no rule.
GUARDS={}
def expr(key,function,old,new='True',label=None):
    GUARDS[key]=(label or function+': '+old,lambda s:replace(s,function,old,new))
def block(key,function,contains,label=None):
    GUARDS[key]=(label or function+': '+contains,lambda s:condition(s,function,contains))

block('D01','decode','EVENT_VALIDATOR')
block('D02','decode',"row['payload_schema_id']")
block('D03','decode',"event['scope_kind']")
block('D04','decode','len(rfc8785.dumps(payload))')
GUARDS['D05']=('decode/stored: exact pack media and reference grammar',lambda s:s.replace(':application/json\\Z', ':[^:]+\\Z'))
expr('D06','decode',"event['payload'] != {}",'False')
block('D07','decode',"not source or")
expr('D08','decode','len(body) != int(size)','False')
expr('D09','decode','blake3(body).hexdigest() != digest','False')
GUARDS['D10']=('canonical JSON: unique members and canonical serialization (same encoding rule)',lambda s:replace(condition(s,'unique_object','key in result'),'decode','rfc8785.dumps(payload) != body','False'))
expr('D11','decode','len(body) <= INLINE_LIMIT','False')
block('D12','decode','validator(schema')
block('D13','decode',"payload['project_id'] != event['project_id']")
block('D14','decode','payload.get(field)')
block('D15','decode',"payload['created_at_utc']")
block('D16','decode',"payload['actor_ref']")
block('D17','decode',"event['idempotency_key']")
block('D18','decode',"point['project_id']")
block('H01','inspect',"source['withdrawn']")
block('H02','inspect',"source['source_valid']")
block('H03','inspect',"source['project_id']")
block('H04','inspect',"source['original_payload']")
block('H06','resolve_history','not full_value_matches')
GUARDS['H05']=('explicit supported historical decoder selection',lambda s:replace(condition(s,'resolve_history','decoder != HISTORICAL_V1'),
    'resolve_history','decode(row, event, packs, validation=decoder)','decode(row, event, packs, validation=HISTORICAL_V1)').replace(
    "original['custody'], validation=decoder)","original['custody'], validation=HISTORICAL_V1)"))
block('F01','full_value_matches','stored_event_valid')
expr('F02','full_value_matches','value_bytes(candidate) == value_bytes(stored)')
expr('F03','full_value_matches',"custody['scope_partition'] == scope_partition(candidate['project_id'])")
expr('F04','full_value_matches',"custody['event_type'] == candidate['event_type']")
expr('F05','full_value_matches',"custody['idempotency_key'] == candidate['idempotency_key']")
expr('F06','full_value_matches',"receipt['sequence_id'] == candidate['sequence_id']")
expr('F07','full_value_matches',"result['original_segment_ref'] == custody['original_segment_ref']")
expr('F08','full_value_matches',"commitment(candidate) == custody['original_event_value_commitment'] == result['original_event_value_commitment']")
expr('F09','full_value_matches',"semantic_digest(candidate) == custody['producer_semantic_digest']")
expr('F10','full_value_matches',"receipt == custody['first_append_receipt']")
expr('F11','full_value_matches',"receipt['event_id'] == candidate['event_id'] == custody['event_id']")
expr('F12','full_value_matches',"result == original['result']")
expr('F13','full_value_matches',"custody == original['custody']")
block('V01','stored_event_valid','EVENT_VALIDATOR')
block('V02','stored_event_valid',"event['scope_kind']")
expr('V03','stored_event_valid',"bool(PACK_REF.fullmatch(event['payload_ref']))")
expr('V04','stored_event_valid',"event['payload'] == {}")
expr('V05','stored_event_valid',"len(rfc8785.dumps(event['payload'])) <= INLINE_LIMIT")
expr('V06','stored_event_valid',"validator(load(row['payload_schema_ref']), validation=validation).is_valid(event['payload'])")
# Unknown dispatch returns the final False, not a forged matching row.
expr('V07','stored_event_valid','\n    return False','\n    return True')
block('A01','append','not admission')
block('A02','append','not source_valid')
GUARDS['A03']=('append: replay policy before dedupe (both refusal branches)',lambda s:condition(condition(s,'append',"== 'projector_replay_only'"),'append',"!= 'dedupe_by_idempotency_key'"))
block('A04','append',"event['event_id'] in self.global_ids")
expr('A05','append',"original['custody']['producer_semantic_digest'] == digest")
block('A06','append','EVENT_VALIDATOR')
block('A07','append','not full_value_matches')
expr('P01','policies_match',"row.get('index_retention_policy_ref') == index_policy")
expr('P02','policies_match',"row.get('checkpoint_retention_policy_ref') == checkpoint_policy")
expr('P03','policies_match',"'derived_retention_policy_ref' not in row")
GUARDS['C01']=('checkpoint: schema/key route and resolved checkpoint target',lambda s:condition(condition(s,'checkpoint_matches',"row['checkpoint_key']"),'checkpoint_matches',"definition !="))
block('C02','checkpoint_matches',"validator(schema, 'checkpoint')")
block('C03','checkpoint_matches',"bundle['checkpoint_key'] ==")
GUARDS['C04']=('checkpoint live selection/verification/snapshot, including the repeated token snapshot join',
    lambda s:replace(condition(s,'checkpoint_matches',"node['state']"),'checkpoint_matches',
        'token != expected_token',"{k:v for k,v in token.items() if k != 'redb_snapshot_id'} != {k:v for k,v in expected_token.items() if k != 'redb_snapshot_id'}"))
block('C05','checkpoint_matches',"generation != expected_generation")
block('C06','checkpoint_matches',"not full_value_matches")
block('C07','checkpoint_matches',"source['scope_partition']")
block('C08','checkpoint_matches',"selection['current_bytes_sha256']")
block('C09','checkpoint_matches',"anchor['source_selection'] != selection")
block('C10','checkpoint_matches',"coverage['last_frame']")
block('C11','checkpoint_matches',"segment['scan_start_offset']")
expr('C12','checkpoint_matches',"bundle['datasets'] == {token['index_dataset_name']: dataset}")
expr('C13','checkpoint_matches',"frontier['index_row_count'] == 1")
expr('C14','checkpoint_matches',"frontier['index_row_set_sha256'] == binding_digest(dict(\n                    domain='pm.event_index.row_set.v1', entries=[dict(key=row_key, value=expected_row)]))")
block('O01','observation_admissible',"source['proof_valid']")
block('O02','observation_admissible',"candidate['correlation_id'] != grouping_identity")
block('O03','observation_admissible',"payload['type_payload'] != source")
expr('O04','observation_admissible',"candidate['producer_sequence_id'] == 0 and candidate['parent_event_id'] is None")
block('O05','observation_admissible',"payload['artifact_id'] !=")
block('O06','observation_admissible',"payload['type_payload'] == old['type_payload']")
block('O07','observation_admissible',"old_status != 'available'")
expr('O08','observation_admissible',"candidate['producer_sequence_id'] == previous['producer_sequence_id'] + 1")
expr('O09','observation_admissible',"candidate['parent_event_id'] == previous['event_id']")
expr('O10','observation_admissible',"candidate['correlation_id'] == previous['correlation_id']")
GUARDS['S01']=('whole-document schema references, including optional/unvisited definitions',lambda s:replace(s,'errors','        return errors','        return []'))
expr('S02','exact_pattern',"re.search(pattern, instance) and re.fullmatch(pattern, instance) is None",'False')
expr('S04','exact_pattern_properties',"re.search(pattern, key) and re.fullmatch(pattern, key) is None",'False')
GUARDS['S03']=('current-writer provider hash overlay',lambda s:replace(s,'validator',"validation == CURRENT_WRITER and schema.get('$id')", "False and schema.get('$id')"))
expr('S05','rejected','    return False','    return True')
block('I01','identity','type(revision)')
block('I02','value_bytes','not math.isfinite')
block('I03','value_bytes','type(value) not in')
block('S06','validator','validation not in')


def evaluate(suite,m):
    return {(g,f,n):(accepted(lambda:good(m)),accepted(lambda:bad(m))) for g,f,n,good,bad in suite}


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path)
    parser.add_argument('--case');parser.add_argument('--full-checker',action='store_true')
    args=parser.parse_args();source=CHECKER.read_text();baseline=module(source);suite=cases(baseline)
    outcomes=evaluate(suite,baseline)
    baseline_bad=[list(k)+[list(v)] for k,v in outcomes.items() if v!=(True,False)]
    print('baseline pairs: '+str(len(outcomes))+', failures: '+str(len(baseline_bad)),file=sys.stderr,flush=True)
    rows=[]
    for guard,(label,mutate) in GUARDS.items():
        if args.case and args.case not in guard:continue
        altered=mutate(source);m=module(altered,None if guard=='S01' else baseline.SchemaReferences());actual=evaluate(suite,m)
        # These are the SAME rule/fault at a forwarded caller boundary, not an
        # unrelated negative: append uses full_value's schema precondition;
        # historical resolution uses its exact authenticated custody equality.
        linked={'F01':{'A07'},'F13':{'H06'}}.get(guard,set())
        own=[k for k in outcomes if k[0] in {guard}|linked]
        flips=[k for k in own if actual[k]==(True,True)]
        masked=[k for k in own if actual[k]!=(True,True)]
        cross=[k for k in outcomes if k not in own and actual[k]!=(True,False)]
        stayed=[k for k in outcomes if k not in own and actual[k]==(True,False)]
        code=report=None
        if args.full_checker:
            stream=io.StringIO()
            with contextlib.redirect_stdout(stream):code=int(m.main())
            report=json.loads(stream.getvalue())
        passed=bool(own) and not masked and not cross and not baseline_bad
        if args.full_checker:passed=passed and code==1 and report['status']=='fail'
        row=dict(guard=guard,rule=label,pass_=passed,linked_same_rule_guards=sorted(linked),negatives_that_flip=flips,masked=masked,
            negatives_that_stay_rejected=stayed,cross_flips=cross,
            mutant_sha256=hashlib.sha256(altered.encode()).hexdigest(),
            full_checker_exit=code,full_checker_failures=report['failures'] if report else None)
        rows.append(row);print(guard+': '+('pass' if passed else 'FAIL')+f' flips={len(flips)}/{len(own)} cross={len(cross)}',file=sys.stderr,flush=True)
    report=dict(status='pass' if rows and all(r['pass_'] for r in rows) else 'fail',
        checker_sha256=hashlib.sha256(source.encode()).hexdigest(),guard_count=len(GUARDS),
        witness_sha256=hashlib.sha256((ROOT/'scripts/pm_runtime_artifact_guard_cases.py').read_bytes()).hexdigest(),
        driver_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        negative_pairs=len(outcomes),baseline_failures=baseline_bad,rows=rows,native_execution='NOT_RUN',admission='NONE')
    body=json.dumps(report,indent=2)+'\n'
    if args.output:args.output.write_text(body)
    else:print(body,end='')
    return report['status']!='pass'

if __name__=='__main__':sys.exit(main())
