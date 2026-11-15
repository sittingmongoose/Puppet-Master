#!/usr/bin/env python3
"""Executable s3bo checker, single-defect matrix and exact-refusal mutation proof.

matrix: run every complete control/negative; mutation rows count a kill only
when the intact checker returns exactly the named guard AND exact code.
guards: run Method B in a fresh subprocess per <=8-row table, serially
(--tables limits it to table-name prefixes, e.g. --tables sr_).
batteries: the common boundary number/time batteries.
corpus: the full shared number/date-time corpus through every family boundary
owned by an extension (pm_s3bo_oracles EXTENSION CONTRACT).
evidence: extension-owned extra evidence (for example a pinned package replay).
run: matrix, batteries, corpus, evidence and the guard proof.
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


def summarize(out,exit_code=0,tables=None):
    summaries=[json.loads((out/(name+'.summary.json')).read_text()) for name in chosen_tables(tables)]
    result={'status':'pass' if not exit_code else 'fail','tables':len(summaries),
            'rows':sum(x['rows'] for x in summaries),'proved':sum(x['proved'] for x in summaries),
            'unproved':[r for x in summaries for r in x['unproved']],
            'flips':sum(x['flips'] for x in summaries),'stays':sum(x['stays'] for x in summaries),
            'max_rows':max(x['rows'] for x in summaries),'detail':summaries,
            'tool_sha256':hashlib.sha256((w.ROOT/'scripts/pm_guard_isolation.py').read_bytes()).hexdigest(),
            'scope':'Only real table predicates are scanned/cut. Projection/helper semantics are checked by the complete lane matrix and reviewed separately.'}
    save(out/'guards.json',result)
    return result


def chosen_tables(spec):
    """All tables, or those whose name starts with one of the comma-separated prefixes."""
    names=w.table_names()
    if not spec:
        return names
    prefixes=tuple(x for x in spec.split(',') if x)
    picked=[n for n in names if n.startswith(prefixes)]
    if not picked:
        raise SystemExit('no table matches '+spec)
    return picked


def guards(out,tables=None):
    exit_code=0
    for name in chosen_tables(tables):
        g.MemoryGate(1800,12,12,30,2700).check()
        code=subprocess.call([sys.executable,'-B',__file__,'table','--name',name,'--out',str(out)])
        exit_code=max(exit_code,code)
        if code:return {'status':'fail','failed_table':name}
    return summarize(out,exit_code,tables)


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


CORPUS_PATH = 'Plans/event_number_recipe_corpus.json'
U53 = (1<<53)-1


def _typed(value):
    """Decode the corpus's typed-value notation into the Python value it names."""
    from decimal import Decimal
    if isinstance(value,dict) and len(value)==1:
        (tag,text),=value.items()
        if tag=='@int':return int(text)
        if tag=='@float':return float(text)
        if tag=='@decimal':return Decimal(text)
    return value


def number_corpus():
    """Every shared integer-slot corpus value with the corpus's own domain verdict.

    'accepted' values carry their exact integer; the slot's OWNER bounds are
    applied afterwards. A corpus refusal that is only a range refusal under the
    corpus's own bounds is re-decided under the slot's bounds; a type/token
    refusal refuses at every slot. Raw tokens that are not JSON values
    (json_syntax) cannot occupy a slot and are listed as not applicable.
    """
    corpus=json.loads((w.ROOT/CORPUS_PATH).read_text());values=[];skipped=[]
    for x in corpus['cases']:
        op=x['op']
        if op not in ('slot','integer','uint64','current_json_slot'):continue
        if op in ('slot','current_json_slot'):
            if x.get('error')=='json_syntax':
                skipped.append({'id':x['id'],'reason':'not a JSON value; parser-level, never reaches a slot'});continue
            try:parsed=w.loads_current_json(x['raw'])
            except w.Refusal as exc:
                skipped.append({'id':x['id'],'reason':'parser refusal '+exc.reason});continue
            if op=='current_json_slot':
                for key in x['path']:parsed=parsed[key]
            value=parsed
        else:
            value=_typed(x['value'])
        if 'returns' in x:
            verdict=('integer',int(x['returns']['@int']))
        elif x.get('error')=='integer_range':
            verdict=('integer',value if isinstance(value,int) and not isinstance(value,bool) else int(value))
        else:
            verdict=('refused',x.get('error'))
        values.append({'id':x['id'],'value':value,'verdict':verdict})
    return values,skipped


def datetime_corpus():
    """Shared date-time corpus values per profile, with the corpus's own verdict."""
    corpus=json.loads((w.ROOT/CORPUS_PATH).read_text());out={w.EVENT_RECORD:[],w.STORAGE_UTC_Z:[]}
    for x in corpus['cases']:
        if x['op']!='datetime':continue
        profile=x.get('profile')
        accepted='output' in x
        if profile is None:
            out[w.EVENT_RECORD].append({'id':x['id'],'value':x['value'],'accepted':accepted})
            if not accepted:
                # A refusal under the broad EventRecord grammar refuses under
                # the narrower Storage UTC-Z profile too.
                out[w.STORAGE_UTC_Z].append({'id':x['id'],'value':x['value'],'accepted':False})
        elif profile==w.STORAGE_UTC_Z:
            out[w.STORAGE_UTC_Z].append({'id':x['id'],'value':x['value'],'accepted':accepted})
    return out


def _isolated_downstream(value):
    """Shared physical bytes and RFC 8785 JCS outcome of the one value, alone."""
    from pm_event_numbers import qualified_jcs
    if w.caught(w.storage_value_bytes,{'n':value},profile=w.EVENT_VALUE):
        return ['physical_value']
    if w.caught(qualified_jcs,{'n':value}):
        return ['producer_jcs']
    return []


def _expected_number(entry,bounds,row,downstream,container_row=None):
    kind,detail=entry['verdict'];expected=[]
    if kind=='refused' and container_row and isinstance(entry['value'],(list,dict)):
        # A container at an integer slot is refused by the complete owner
        # schema's type keyword: the number projection enumerates integer leaves.
        expected.append(container_row)
    elif kind=='refused':
        expected.append(row)
    else:
        lo,hi=bounds.get('minimum'),bounds.get('maximum')
        if (lo is not None and detail<lo) or (hi is not None and detail>hi):
            expected.append(row)
    if downstream:
        expected+=_isolated_downstream(entry['value'])
    return sorted(set(expected))


def _base_slots(control):
    """Common payload integer and envelope/receipt timestamp slots of a control."""
    value=control['value'];f=value['family']
    for path,_number,schema in w.integers(value['event']['payload'],w.schema_for(f)):
        yield {'paths':[('event','payload')+path],'kind':'integer','row':'integer_domain','downstream':True,
               'container_row':'payload_schema','bounds':{k:schema[k] for k in ('minimum','maximum') if k in schema}}
    for path,_text in w.timestamps(value['event']):
        storage=path in [('observed_at_utc',),('persisted_at_utc',)]
        # A non-string timestamp is refused by the complete schema's type
        # keyword; the shared date_time call receives string slots only.
        yield {'paths':[('event',)+path],'kind':'datetime','row':'storage_time' if storage else 'source_time',
               'profile':w.STORAGE_UTC_Z if storage else w.EVENT_RECORD,
               'type_rows':['payload_schema' if path[0]=='payload' else 'envelope_schema']}
    yield {'paths':[('receipt','acknowledged_at_utc')],'kind':'datetime','row':'ack_time','profile':w.EVENT_RECORD,
           'type_rows':['ack_time','receipt_schema']}


def corpus(out):
    """The full shared number and date-time corpus through every completed family boundary.

    Runs on every control of a family owned by an extension, at the common
    payload/envelope/receipt slots and at every boundary slot the extension
    declares. A slot's copies are changed together so that only the slot's own
    domain predicate (and the shared physical/JCS rule for payload values) can
    refuse. Expectations come from the corpus verdicts and owner bounds, never
    from the checker.
    """
    controls,_=c.cases();numbers,skipped=number_corpus();times=datetime_corpus()
    owned={f for ext in w.EXTENSIONS for f in ext.FAMILIES}
    results=[];inventory=[]
    for control in controls:
        base=control['value'];f=base['family']
        if f not in owned:continue
        slots=list(_base_slots(control))
        for ext in w.EXTENSIONS:
            if f in ext.FAMILIES and hasattr(ext,'corpus_slots'):
                slots+=list(ext.corpus_slots(control))
        for slot in slots:
            inventory.append({'control':control['id'],'paths':[list(p) for p in slot['paths']],'kind':slot['kind'],
                              'row':slot['row'],'bounds' if slot['kind']=='integer' else 'profile':
                              slot.get('bounds') if slot['kind']=='integer' else slot['profile']})
            entries=numbers if slot['kind']=='integer' else times[slot['profile']]
            for entry in entries:
                case=copy.deepcopy(base)
                for path in slot['paths']:
                    c.set_path(case,path,entry['value'])
                if slot['kind']=='integer' and entry['value'] is None and 'null_rows' in slot:
                    # null is a declared type at a nullable owner slot: the closed
                    # schema branch (and any join on it) owns the refusal.
                    expected=sorted(slot['null_rows'])
                elif slot['kind']=='integer':
                    expected=_expected_number(entry,slot.get('bounds',{}),slot['row'],slot.get('downstream',False),
                                              slot.get('container_row'))
                elif not isinstance(entry['value'],str):
                    expected=sorted(slot.get('type_rows',[slot['row']]))
                else:
                    expected=[] if entry['accepted'] else [slot['row']]
                errors,_=w.evaluate(case)
                actual=sorted({row for row,_code in errors})
                codes_ok=all(code==c.code(row) for row,code in errors)
                results.append({'control':control['id'],'path':list(slot['paths'][0]),'corpus_id':entry['id'],
                                'expected':expected,'actual':actual,'pass':actual==expected and codes_ok})
    result={'status':'pass' if results and all(x['pass'] for x in results) else 'fail',
            'corpus':CORPUS_PATH,'corpus_sha256':hashlib.sha256((w.ROOT/CORPUS_PATH).read_bytes()).hexdigest(),
            'families':sorted(owned),'cases':len(results),'passed':sum(x['pass'] for x in results),
            'number_values':len(numbers),'not_applicable_number_tokens':skipped,
            'datetime_values':{k:len(v) for k,v in times.items()},
            'failed':[x for x in results if not x['pass']][:200],'inventory':inventory,'results':results}
    save(out/'corpus.json',result)
    return result


def extension_evidence(out):
    results={}
    for ext in w.EXTENSIONS:
        if hasattr(ext,'evidence'):
            results[ext.__name__]=ext.evidence(out)
    status='pass' if all(r.get('status')=='pass' for r in results.values()) else 'fail'
    result={'status':status,'extensions':results}
    save(out/'extension-evidence.json',result)
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['matrix','guards','table','batteries','corpus','evidence','run','summarize'])
    parser.add_argument('--out',type=Path,required=True);parser.add_argument('--name')
    parser.add_argument('--tables',help='guards/summarize: comma-separated table-name prefixes (default: every table)')
    args=parser.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    if args.command=='table':return guard_table(args.name,args.out)
    if args.command=='matrix':result=matrix(args.out)
    elif args.command=='guards':result=guards(args.out,args.tables)
    elif args.command=='batteries':result=batteries(args.out)
    elif args.command=='corpus':result=corpus(args.out)
    elif args.command=='evidence':result=extension_evidence(args.out)
    elif args.command=='summarize':result=summarize(args.out,0,args.tables)
    else:
        m=matrix(args.out);b=batteries(args.out);k=corpus(args.out);e=extension_evidence(args.out);g_=guards(args.out,args.tables)
        result={'status':'pass' if all(r['status']=='pass' for r in (m,b,k,e,g_)) else 'fail',
                'matrix':{k_:m[k_] for k_ in ('status','controls','negatives')},
                'batteries':{k_:b[k_] for k_ in ('status','cases','passed')},
                'corpus':{k_:k[k_] for k_ in ('status','cases','passed')},
                'evidence':{'status':e['status']},
                'guards':{k_:g_[k_] for k_ in ('status','tables','rows','proved','unproved','flips','stays')}}
        save(args.out/'summary.json',result)
    print(json.dumps({k:v for k,v in result.items() if k in ('status','controls','negatives','cases','passed','matrix','batteries','guards')}))
    return 0 if result['status']=='pass' else 1


if __name__=='__main__':
    sys.exit(main())
