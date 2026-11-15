#!/usr/bin/env python3
"""Full DFM replay, owner-profile timestamp corpus, and sealed-store observations."""
import argparse
import collections
import copy
import gzip
import importlib.util
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
_spec = importlib.util.spec_from_file_location('dfm_c12',Path(__file__).with_name('pm-filemanager-c12-closure.py'))
c12=importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(c12)
dfm,ROOT=c12.dfm,c12.ROOT


def write(path, value):
    with gzip.open(path,'wt') as handle:
        json.dump(value,handle,indent=1,sort_keys=True)
        handle.write('\n')


def date_values():
    corpus=json.loads((ROOT/'Plans/event_number_recipe_corpus.json').read_text())
    values={}
    for case in corpus['cases']:
        if case['op'] in ('datetime','datetime_direct','envelope_datetime','family_datetime') and isinstance(case.get('value'),str):
            values[case['value']]=True
    for sample in json.loads((ROOT/'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']:
        values[sample['value']]=True
    return list(values)


def expected_time(value,profile):
    try:
        dfm.date_time(value,profile=profile)
        return True
    except dfm.Refusal:
        return False


def coherent_time(row,field,value):
    """Fixture writer only. Construct the independently stored copies BEFORE the read."""
    name=row['event_type']
    payload,trace=copy.deepcopy(row['payload']),copy.deepcopy(row['trace'])
    model=trace['custody_model']
    operation=model['operation_rows'][model['operation_key']]
    event=operation['complete_event']
    if field=='ts':
        payload['ts']=value
        operation['settlement']['settled_at_utc']=value
        event['occurred_at_utc']=value
    elif field=='accepted_at_utc':
        operation['accepted_command']['accepted_at_utc']=value
    elif field=='acknowledged_at_utc':
        model['append_rows'][model['append_key']]['first_append_receipt'][field]=value
    else:
        event[field]=value
    dfm.synchronize_fixture(name,payload,trace)
    return payload,trace


def time_refusal(name,field,value,profile):
    phase='schema_payload_'+name.replace('.','_') if field=='ts' else 'schema_operation_custody'
    broad=expected_time(value,dfm.EVENT_RECORD)
    if field=='acknowledged_at_utc':
        keyword,path='anyOf',['first_append_receipt']
    elif field in ('observed_at_utc','persisted_at_utc'):
        keyword,path=('format',['complete_event',field]) if broad else ('anyOf',['complete_event'])
    elif field=='accepted_at_utc':
        keyword,path='format',['accepted_command',field]
    else:
        keyword,path='format',['ts']
    return {'status':'refused','phase':phase,'row':dfm.table_rows(phase)[0][0],
            'code':'schema','schema':{'validator':keyword,'path':path}}


def timestamps(fixtures,include_leaf=True):
    values=date_values()
    ledger,failures=[],[]
    for row in fixtures['rows']:
        name=row['event_type']
        for field in ('ts','accepted_at_utc','acknowledged_at_utc','observed_at_utc','persisted_at_utc'):
            profile=dfm.STORAGE_UTC_Z if field in ('observed_at_utc','persisted_at_utc') else dfm.EVENT_RECORD
            for value in values:
                payload,trace=coherent_time(row,field,value)
                expected=expected_time(value,profile)
                refusal=time_refusal(name,field,value,profile)
                for historical in (False,True):
                    before=copy.deepcopy(trace['custody_model'])
                    got=c12.outcome(lambda:dfm.validate_case(name,payload,trace,historical=historical))
                    unchanged=dfm.same_value(before,trace['custody_model'])
                    valid=(got=={'status':'accepted'} if expected else got==refusal)
                    entry={'family':name,'field':field,'profile':profile,'value':value,
                           'historical':historical,'expected':'accepted' if expected else refusal,
                           'actual':got,'store_unchanged':unchanged}
                    ledger.append(entry)
                    if not valid or not unchanged:failures.append(entry)
            print('timestamps',name,field,len(ledger),'failures',len(failures),flush=True)
    # Each physical declaration, including isolated noncompletion and receipt/result definitions.
    leaf=[]
    for (doc,ptr),node in c12.schema_nodes(dfm.schema_documents()).items():
        if not include_leaf:break
        if isinstance(node,dict) and node.get('format')=='date-time':
            for value in values:
                got=c12.outcome(lambda:dfm.validate_shape(doc,ptr,value))
                phase=dfm.schema_phase(doc,ptr)
                keyword='minLength' if len(value)<node.get('minLength',0) else 'format'
                expected={'status':'accepted'} if expected_time(value,dfm.EVENT_RECORD) else {
                    'status':'refused','phase':phase,'row':dfm.table_rows(phase)[0][0],'code':'schema',
                    'schema':{'validator':keyword,'path':[]}}
                valid=got==expected
                entry={'document':doc,'pointer':ptr,'profile':dfm.EVENT_RECORD,'value':value,'actual':got}
                leaf.append(entry)
                if not valid:failures.append(entry)
    return {'status':'pass' if not failures else 'fail','values':values,'complete_boundary':ledger,
            'physical_declarations':leaf,'failures':failures,
            'summary':{'values':len(values),'complete_boundary':len(ledger),'leaf':len(leaf),'failures':len(failures)}}


def retained(fixtures):
    observations,stores,failures=[],{},[]
    for row in fixtures['rows']:
        for variant in ('accepted','missing','ambiguous','foreign','unknown_edition','replaced_resource'):
            trace=copy.deepcopy(row['trace'])
            model=trace['custody_model']
            key=model['append_key']
            if variant=='missing':model['original_custody'].pop(key)
            elif variant=='ambiguous':model['original_custody'][key]=[copy.deepcopy(model['original_custody'][key])]*2
            elif variant=='foreign':model['original_custody'][key+'foreign']=model['original_custody'].pop(key)
            elif variant=='unknown_edition':model['original_custody'][key]['write_time_edition']='not-installed'
            elif variant=='replaced_resource':model['original_custody'][key]['resource_manifest_sha256']='0'*64
            expected={'status':'accepted'} if variant=='accepted' else {
                'status':'refused','phase':'retained_dispatch',
                'row':'OD02_recipe_installed' if variant in ('unknown_edition','replaced_resource') else 'OD01_original_custody',
                'code':'recipe_unsupported' if variant in ('unknown_edition','replaced_resource') else 'original_unavailable',
                'schema':None}
            before=copy.deepcopy(model)
            before_hash=c12.digest(before)
            actual=c12.outcome(lambda:dfm.validate_case(row['event_type'],row['payload'],trace,historical=True))
            after=copy.deepcopy(model)
            after_hash=c12.digest(after)
            stores.setdefault(before_hash,before)
            stores.setdefault(after_hash,after)
            entry={'family':row['event_type'],'variant':variant,'expected':expected,'actual':actual,
                   'before':before_hash,'after':after_hash,'store_unchanged':dfm.same_value(before,after)}
            observations.append(entry)
            if actual!=expected or not entry['store_unchanged']:failures.append(entry)
    return {'status':'pass' if not failures else 'fail','observations':observations,'stores':stores,'failures':failures}


def joins(fixtures):
    """Original join witnesses retain distinct source/result/receipt/checkpoint copies."""
    rows=[]
    cases=dfm.p2a_cases()
    names=('event-project','event-correlation','event-occurred-at','event-payload-schema','event-forged-id',
           'custody-storage','custody-event-id','custody-event-type','custody-idempotency',
           'receipt-event-id','receipt-sequence','receipt-ordinary','late-operation-value','late-control-value',
           'settled-payload-changed','checkpoint-extra-field')
    for row in fixtures['rows']:
        model=row['trace']['custody_model']
        operation=model['operation_rows'][model['operation_key']]
        event=operation['complete_event']
        independent=(event is not model['request']['event'] and event is not model['retry_event'] and
                     operation is not model['final_operation'] and
                     operation['first_append_receipt'] is not model['result']['first_append_receipt'])
        assert independent
        for case in cases[row['event_type']]:
            if not any(case['name'].endswith(':'+name) for name in names):continue
            actual=c12.outcome(lambda:dfm.boundary_case(row,case))
            assert actual.get('row')==case['expected_row'],(case['name'],actual)
            rows.append({'family':row['event_type'],'case':case['name'],'expected_row':case['expected_row'],
                         'actual':actual,'distinct_copies':independent,'steps':case.get('steps')})
    return {'status':'pass','witnesses':rows}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--scope',choices=['all','replay','retained','timestamps'],default='all')
    parser.add_argument('--family',action='append')
    parser.add_argument('--skip-leaf',action='store_true')
    args=parser.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    fixtures=dfm.integrity_inputs()['fixtures']
    if args.family:
        fixtures=copy.deepcopy(fixtures)
        fixtures['rows']=[r for r in fixtures['rows'] if r['event_type'] in args.family]
        assert len(fixtures['rows'])==len(args.family),'unknown or repeated family'
    statuses=[]
    if args.scope in ('all','replay'):
        for row in fixtures['rows']:
            dfm.main(row['event_type'])
        write(args.out/'joins.json.gz',joins(fixtures))
        statuses.append('pass')
    if args.scope in ('all','retained'):
        result=retained(fixtures)
        write(args.out/'retained.json.gz',result)
        statuses.append(result['status'])
        print('retained',result['status'],len(result['observations']),flush=True)
    if args.scope in ('all','timestamps'):
        result=timestamps(fixtures,not args.skip_leaf)
        write(args.out/'timestamps.json.gz',result)
        statuses.append(result['status'])
        print(json.dumps(result['summary']),flush=True)
    return int(any(status!='pass' for status in statuses))


if __name__=='__main__':
    raise SystemExit(main())
