#!/usr/bin/env python3
"""Executable s3bo checker, single-defect matrix and exact-refusal mutation proof.

matrix: run every complete control/negative; mutation rows count a kill only
when the intact checker returns exactly the named guard AND exact code.
guards: run Method B in a fresh subprocess per <=8-row table, serially.
run: matrix, boundary batteries, companion schemas and every guard proof.
Use long-job and the run's memory cap; do not run against a live app.
"""
import argparse
import copy
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys

import pm_guard_isolation as g
import pm_s3bo_oracles as w
import pm_s3bo_cases as c


def save(path, value):
    path.write_text(json.dumps(value,indent=1,sort_keys=True)+'\n')


def matrix(out):
    controls,negatives=c.cases(); failures=[]; mutations=[]
    for control in controls:
        errors,_=w.evaluate(control['value'])
        if errors: failures.append({'control':control['id'],'actual':errors})
    for n in negatives:
        errors,_=w.evaluate(n['value'])
        expected=[(n['target'],n['code'])]
        kill=errors==expected
        mutations.append({'id':n['id'],'family':n['family'],'guard':n['target'],'expected_code':n['code'],
                          'actual':errors,'killed':kill,'defect':n['defect']})
        if not kill:failures.append({'negative':n['id'],'expected':expected,'actual':errors})
    rows=[]
    for row in w.ROW:
        witnesses=[x for x in mutations if x['guard']==row]
        rows.append({'guard':row,'mutations':len(witnesses),'killed':sum(x['killed'] for x in witnesses),
                     'survived':sum(not x['killed'] for x in witnesses)})
    result={'status':'pass' if not failures else 'fail','controls':len(controls),'negatives':len(negatives),
            'failures':failures,'tables':{name:len(w.table_rows(name)) for name in w.table_names()},
            'mutation_table':rows,'mutation_rule':'Only exactly [(expected_guard, expected_code)] counts as killed.',
            'mutations':mutations}
    save(out/'matrix.json',result)
    return result


def selected(name):
    """Deduplicate complete-boundary projections, never synthetic row verdicts.

    The complete lane matrix covers all families. The tool consumes each
    distinct table input, controls deduplicated down to one per family/scope.
    Raw mutations of different source copies remain distinct witnesses.
    """
    controls,negatives=c.cases(); ids={r[0] for r in w.table_rows(name)}
    def project(value):
        complete=w.operands(value)
        return {row:complete[row] for row in ids}
    cs=[]; ns=[]; seen=set()
    chosen=[];targets=set()
    for n in negatives:
        if n['target'] in ids and n['target'] not in targets:
            targets.add(n['target']);chosen.append(n)
    needed={n['control'] for n in chosen}
    control_values={x['id']:project(x['value']) for x in controls if x['id'] in needed}
    control_alias={}
    for x in controls:
        if x['id'] not in needed:continue
        value=control_values[x['id']];key=json.dumps(value,sort_keys=True)
        if key not in seen:
            seen.add(key);cs.append(g.Control(x['id'],value,'append'))
        control_alias[x['id']]=next(c.id for c in cs if c.value==value)
    for n in chosen:
        value=project(n['value']);key=json.dumps(value,sort_keys=True)
        ns.append(g.Negative(n['id'],value,n['target'],n['code'],control_alias[n['control']],
                            'One original source change: '+json.dumps(n['defect'],sort_keys=True)))
    return cs,ns


def guard_table(name,out):
    cs,ns=selected(name);module=w.table_module(name);path='scripts/pm_s3bo_table_'+name+'.py'
    suite=g.Suite('s3bo '+name,module.case,cs,ns,(path,),w.ROOT,
                  non_guards=[g.NonGuard(path,'case','return','return g.Case(table, check, context)',
                              'Construct a fresh Case; this plumbing return does not decide acceptance.')])
    report=g.run(suite,memory=g.MemoryGate(1800,10,12,30,2700))
    with gzip.open(out/(name+'.json.gz'),'wt') as f:json.dump(report,f,sort_keys=True,indent=1)
    summary={'table':name,'status':report['status'],'rows':len(w.table_rows(name)),
             'proved':sum(bool(r.get('proved')) for r in report.get('rows',[])),
             'unproved':report.get('unproved_guards',[]),'controls':len(cs),'negatives':len(ns),
             'evaluations':report.get('evaluations'),
             'flips':sum(len(r.get('flips',[])) for r in report.get('rows',[])),
             'stays':sum(len(r.get('stays',[])) for r in report.get('rows',[])),
             'failures':report.get('failures',[])}
    save(out/(name+'.summary.json'),summary)
    print(json.dumps({k:v for k,v in summary.items() if k!='failures'}),flush=True)
    return 0 if report['status']=='PASS' else 1


def summarize(out,exit_code=0):
    summaries=[json.loads((out/(name+'.summary.json')).read_text()) for name in w.table_names()]
    result={'status':'pass' if not exit_code else 'fail','tables':len(summaries),
            'rows':sum(x['rows'] for x in summaries),'proved':sum(x['proved'] for x in summaries),
            'unproved':[r for x in summaries for r in x['unproved']],
            'flips':sum(x['flips'] for x in summaries),'stays':sum(x['stays'] for x in summaries),
            'max_rows':max(x['rows'] for x in summaries),'detail':summaries,
            'tool_sha256':hashlib.sha256((w.ROOT/'scripts/pm_guard_isolation.py').read_bytes()).hexdigest(),
            'scope':'Only real table predicates are scanned/cut. Projection/helper semantics are checked by the complete lane matrix and reviewed separately.'}
    save(out/'guards.json',result)
    return result


def guards(out):
    exit_code=0
    for name in w.table_names():
        g.MemoryGate(1800,12,12,30,2700).check()
        code=subprocess.call([sys.executable,'-B',__file__,'table','--name',name,'--out',str(out)])
        exit_code=max(exit_code,code)
        if code:return {'status':'fail','failed_table':name}
    return summarize(out,exit_code)


def batteries(out):
    controls,_=c.cases();results=[];inventory=[]
    # Every currently owned integer slot is exercised through the COMPLETE
    # checker, including a valid JSON integer with 4,400 digits. The parser
    # must succeed, then the existing physical/JCS admission may refuse it.
    attacks=[('bool',True,'integer_domain'),('fraction',1.5,'integer_domain'),
             ('negative',-1,'integer_domain'),('uint64max',(1<<64)-1,None),
             ('above_binary64',(1<<53)+1,None),('huge',w.loads_current_json('1'+'0'*4399),'physical_value')]
    for control in controls:
        base=control['value'];f=base['family']
        if f in ('storage.deletion_lifecycle_changed','storage.value_quarantine_changed'):
            field='ordinal' if f=='storage.deletion_lifecycle_changed' else 'occurrence'
            row='deletion_ordinal' if field=='ordinal' else 'quarantine_occurrence'
            inventory.append({'family':f,'field':['source',field],'number_call':'current_integer','bounds':{'minimum':1}})
            for label,replacement,target in [('boolean',True,'integer_domain'),('huge',w.loads_current_json('1'+'0'*4399),row)]:
                case=copy.deepcopy(base);case['source'][field]=replacement
                errors,_=w.evaluate(case);expected=[(target,c.code(target))]
                results.append({'family':f,'path':['source',field],'sample':label,'expected':expected,
                                'actual':errors,'pass':errors==expected})
        for path,value,schema in w.integers(base['event']['payload'],w.schema_for(f)):
            inventory.append({'family':f,'field':['payload',*path],'number_call':'current_integer','bounds':{k:schema[k] for k in ('minimum','maximum') if k in schema}})
            for label,replacement,target in attacks:
                case=copy.deepcopy(base);c.set_path(case,('event','payload')+path,replacement)
                # Exact route is authored from owner domain, then physical,
                # then JCS. Joins use a separate source; only byte-domain-valid
                # complete positives require refreshing that distinct source.
                if label=='negative' and schema.get('minimum',-1)<0:continue
                if target is None:
                    target='producer_jcs'
                    if schema.get('maximum',(1<<64)-1)<replacement:target='integer_domain'
                if f=='seglog.event_appended' and label in ('uint64max','above_binary64','huge'):
                    case['reference']['seq']=replacement
                expected=[(target,c.code(target))]
                if label=='huge' and schema.get('maximum') is not None:
                    expected=[('integer_domain',c.code('integer_domain')),('physical_value',c.code('physical_value'))]
                errors,_=w.evaluate(case)
                results.append({'family':f,'path':list(path),'sample':label,'expected':expected,'actual':errors,
                                'pass':errors==expected})
        for path,value in w.timestamps(base['event']):
            profile=w.STORAGE_UTC_Z if path in [('observed_at_utc',),('persisted_at_utc',)] else w.EVENT_RECORD
            inventory.append({'family':f,'field':list(path),'datetime_call':'date_time','profile':profile})
            target='storage_time' if profile==w.STORAGE_UTC_Z else 'source_time'
            case=copy.deepcopy(base);c.set_path(case,('event',)+path,'2026-02-30T00:00:00Z')
            errors,_=w.evaluate(case)
            results.append({'family':f,'path':list(path),'sample':'impossible_day','expected':(target,c.code(target)),
                            'actual':errors,'pass':errors==[(target,c.code(target))]})
        # E5-2: valid offset/lowercase receipt acknowledgement is preserved.
        case=copy.deepcopy(base);case['receipt']['acknowledged_at_utc']='2026-11-14t12:00:00+00:00'
        errors,_=w.evaluate(case)
        results.append({'family':f,'path':['receipt','acknowledged_at_utc'],'sample':'eventrecord_offset_lowercase',
                        'actual':errors,'pass':errors==[]})
        inventory.append({'family':f,'field':['receipt','acknowledged_at_utc'],'datetime_call':'date_time','profile':w.EVENT_RECORD})
    result={'status':'pass' if all(x['pass'] for x in results) else 'fail','cases':len(results),
            'passed':sum(x['pass'] for x in results),'failed':[x for x in results if not x['pass']],
            'inventory':inventory,'results':results}
    save(out/'batteries.json',result)
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['matrix','guards','table','batteries','run','summarize'])
    parser.add_argument('--out',type=Path,required=True);parser.add_argument('--name')
    args=parser.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    if args.command=='table':return guard_table(args.name,args.out)
    if args.command=='matrix':result=matrix(args.out)
    elif args.command=='guards':result=guards(args.out)
    elif args.command=='batteries':result=batteries(args.out)
    elif args.command=='summarize':result=summarize(args.out)
    else:
        m=matrix(args.out);b=batteries(args.out);g_=guards(args.out)
        result={'status':'pass' if all(r['status']=='pass' for r in (m,b,g_)) else 'fail',
                'matrix':{k:m[k] for k in ('status','controls','negatives')},
                'batteries':{k:b[k] for k in ('status','cases','passed')},
                'guards':{k:g_[k] for k in ('status','tables','rows','proved','unproved','flips','stays')}}
        save(args.out/'summary.json',result)
    print(json.dumps({k:v for k,v in result.items() if k in ('status','controls','negatives','cases','passed','matrix','batteries','guards')}))
    return 0 if result['status']=='pass' else 1


if __name__=='__main__':
    sys.exit(main())
