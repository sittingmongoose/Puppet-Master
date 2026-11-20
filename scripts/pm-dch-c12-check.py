#!/usr/bin/env python3
"""Replay CH1 closure evidence on the original DCH checker and gated guard rows.

Run under the lane memory admission/cap and long-job. Raw evidence belongs
outside the repository. Every output is bound to the actual checker inputs.
"""
import argparse
import contextlib
import copy
import hashlib
import gzip
import io
import json
from pathlib import Path
import sys

import pm_dch_events as m
from pm_dch_c12_cases import cases
from pm_dch_formats import validator
from pm_dch_worktree import FAMILIES, fixtures, RECEIPT_SCHEMA
from pm_event_datetime import date_time, EVENT_RECORD, STORAGE_UTC_Z
from pm_event_numbers import Refusal
from pm_event_numbers_corpus import _value

ROOT=Path(__file__).resolve().parents[1]


def write(out,name,value):
    (out/name).write_text(json.dumps(value,indent=1,sort_keys=True)+'\n')


def sha(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()


def manifest():
    paths=list(ROOT.glob('scripts/pm_dch*.py'))+list(ROOT.glob('scripts/pm-dch*.py'))
    paths+=list(ROOT.glob('Plans/dch*json'))+list(ROOT.glob('Plans/dch_event_payloads/*.json'))
    paths+=list(ROOT.glob('tests/fixtures/dch_c12_ch1/*.json'))
    paths+=[ROOT/p for p in ('scripts/pm_guard_isolation.py','scripts/pm_event_numbers.py','scripts/pm_event_datetime.py',
             'Plans/event_number_recipe_corpus.json','scripts/pm_event_datetime_timestamp_battery.json','Plans/event_datetime_inventory.json',
             'Plans/event_record.schema.json','Plans/event_append_receipt_contracts.schema.json','Plans/storage_value_registry.json')]
    return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths))}


def source_witnesses(out,family=None):
    rows={r['event_type']:r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    results=[];invalid=[]
    for c in cases(family):
        before=sha(c.originals)
        try:
            got=m.worktree_event_outcome(c.record,rows[c.family],c.original_ref,c.originals)
        except Exception as error:
            invalid.append(dict(id=c.name,error=type(error).__name__+': '+str(error),credit=False));continue
        result=dict(id=c.name,family=c.family,clause=c.clause,expected=c.expected,actual=got,
                    control=c.expected is None,pass_=got==c.expected,store_before=before,store_after=sha(c.originals))
        if result['store_after']!=before:result['pass_']=False
        if got==c.expected and got is not None:
            old=m.CUT_ROWS
            try:
                m.CUT_ROWS=frozenset(set(old)|{got[:2]})
                try:cut=m.worktree_event_outcome(c.record,rows[c.family],c.original_ref,c.originals)
                except Exception as error:cut=('EXCEPTION',type(error).__name__,str(error))
            finally:m.CUT_ROWS=old
            restored=m.worktree_event_outcome(c.record,rows[c.family],c.original_ref,c.originals)
            result.update(expected_refusal_kill=True,whole_route_cut=cut,restoration=restored,
                          restoration_exact=restored==c.expected)
            result['pass_']=result['pass_'] and restored==c.expected
        results.append(result)
    report=dict(status='pass' if not invalid and all(r['pass_'] for r in results) else 'fail',
        controls=sum(r['control'] for r in results),expected_refusal_kills=sum(r.get('expected_refusal_kill',False) for r in results),
        invalid_mutations=invalid,results=results)
    write(out,'source-mutations.json',report)
    return report['status']=='pass'


def sealed_snapshot():
    # Snapshot actual protected catalogue maps used by the reader, not a local
    # stand-in digest variable. RECIPE_TUPLES are frozen dataclasses.
    return dict(custody=copy.deepcopy(m.CUSTODY),receipts=[dict(store=k[0],digest=k[1],receipts=copy.deepcopy(v))
        for k,v in sorted(m.RECIPE_RECEIPTS.items())],recipes=copy.deepcopy(m.RETAINED_RECIPES),
        installed=[dict(recipe=k,tuple=repr(v)) for k,v in sorted(m.RECIPE_TUPLES.items())])


def retained(out,family=None):
    from pm_dch_round7_oracles import OWNER_INVALID_ORIGINALS, OWNER_INVALID_CHECKPOINT_RETIRED
    rows={r['event_type']:r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    data=json.loads((ROOT/'Plans/dch_retained_history_fixtures.json').read_text())
    ev=validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()))
    results=[];worlds={}
    def observe(label,record,function,expected):
        before=sealed_snapshot();bid=sha(before)
        if bid not in worlds:
            name='retained-world-'+bid+'.json.gz'
            (out/name).write_bytes(gzip.compress(json.dumps(before,sort_keys=True).encode(),mtime=0))
            worlds[bid]=dict(path=name,sha256=hashlib.sha256((out/name).read_bytes()).hexdigest())
        raw_before=sha(record)
        try:
            function();got=None
        except m.TableRefusal as e:got=(e.phase,e.row,e.code)
        after=sealed_snapshot();aid=sha(after)
        if aid!=bid:
            name='retained-world-'+aid+'.json.gz'
            (out/name).write_bytes(gzip.compress(json.dumps(after,sort_keys=True).encode(),mtime=0))
            worlds[aid]=dict(path=name,sha256=hashlib.sha256((out/name).read_bytes()).hexdigest())
        results.append(dict(id=label,expected=expected,actual=got,pass_=got==expected and bid==aid and raw_before==sha(record),
            store_before=bid,store_after=aid,source_before=raw_before,source_after=sha(record)))
    for item in data['events']:
        f=item['event_type']
        if f not in FAMILIES or family and f!=family:continue
        row=rows[f];pv=validator(json.loads((ROOT/row['payload_schema_ref']).read_text()))
        def read(item=item,row=row,pv=pv):return m._historical_read(item['record'],row,item['witness'],ev,pv)
        valid=item['case'] not in OWNER_INVALID_ORIGINALS
        expected=None if valid else ('hr_flags','HR02_envelope_schema','history_refused')
        observe(f+'/'+item['edition']+'/'+item['case'],item,read,expected)
    # Separate sealed worlds model unavailable, ambiguous and foreign-original
    # receipts. They are established before a read and restored afterwards.
    fs=json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    for fixture in fs:
        f=fixture['event_type']
        if f not in FAMILIES or family and f!=family:continue
        key=(fixture['historical_source']['storage_instance_id'],fixture['historical_source']['source_value_sha256'])
        original=m.RECIPE_RECEIPTS[key]
        pv=validator(json.loads((ROOT/rows[f]['payload_schema_ref']).read_text()))
        for mode,target in [('missing',('rn_receipt','RN07_receipt_present','original_unavailable')),
                            ('ambiguous',('rn_receipt','RN08_receipt_unique','recipe_unsupported')),
                            ('other_original',('rn_original','RO01_receipt_binding','original_unavailable'))]:
            replacement=[] if mode=='missing' else copy.deepcopy(original)
            if mode=='ambiguous':replacement.append(copy.deepcopy(original[0]))
            if mode=='other_original':replacement[0]['binding']['event_id']+=':other'
            m.RECIPE_RECEIPTS[key]=replacement
            try:
                observe(f+'/'+fixture['edition']+'/'+mode,fixture,
                    lambda fixture=fixture,pv=pv:m._historical_read(fixture['record'],rows[f],fixture['historical_source'],ev,pv),target)
            finally:m.RECIPE_RECEIPTS[key]=original
    for item in data['checkpoints']:
        f=item['event_type']
        if f not in FAMILIES or family and f!=family:continue
        valid=item['value']['history'][0]['retired_at_utc']!=OWNER_INVALID_CHECKPOINT_RETIRED
        expected=None if valid else ('cp_schema','CP01_checkpoint_schema','checkpoint_refused')
        observe(f+'/checkpoint/'+item.get('case',item['rule']),item,
            lambda item=item,f=f:m._checkpoint_joins(item['value'],item['source'],rows[f],item['key']),expected)
    report=dict(status='pass' if all(r['pass_'] for r in results) else 'fail',reads=len(results),
                failures=[r for r in results if not r['pass_']],observations=results,
                snapshot_file='retained-store-snapshots.json',snapshot_count=len(worlds))
    write(out,'retained-store-snapshots.json',worlds);write(out,'retained-observations.json',report)
    return report['status']=='pass'


def corpora(out,family=None):
    from pm_dch_number_corpus import run as number_run
    nr=number_run(m)
    numbers=dict(status='pass' if all(ok for _,ok,_ in nr) else 'fail',checks=len(nr),results=nr)
    write(out,'number-corpus.json',numbers)
    corpus=json.loads((ROOT/'Plans/event_number_recipe_corpus.json').read_text())['cases']
    direct=[x for x in corpus if x['op']=='datetime' and x.get('profile',EVENT_RECORD)==EVENT_RECORD]
    samples=json.loads((ROOT/'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']
    samples=[dict(id='battery/'+str(i),value=x['value']) for i,x in enumerate(samples)]
    # The independently authored direct corpus has explicit output/refusal oracles.
    for x in direct:samples.append(dict(id=x['id'],value=_value(x['value']),expected='error' not in x))
    originals=fixtures();results=[];rows={r['event_type']:r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    for f in FAMILIES:
        if family and f!=family:continue
        for edition in ('project','application'):
            ref=f+'/'+edition;base=originals[ref][0]
            for sample in samples:
                val=sample['value'];got_error=None
                try:date_time(val,profile=EVENT_RECORD);wanted=True
                except Refusal as e:wanted=False;got_error=e.reason
                if 'expected' in sample and wanted!=sample['expected']:raise AssertionError('shared direct corpus mismatch '+sample['id'])
                data={ref:[copy.deepcopy(base)]}
                for key in ('receipt','first_receipt'):data[ref][0][key]['acknowledged_at_utc']=val
                got=m.worktree_event_outcome(base['record'],rows[f],ref,data)
                expected=None if wanted else ('sd_complete','SD01_complete_definition','schema_refused')
                results.append(dict(family=f,edition=edition,id=sample['id'],field='acknowledged_at_utc',profile=EVENT_RECORD,
                                    expected=expected,actual=got,shared_reason=got_error,pass_=got==expected))
    # Every pre-existing DCH timestamp declaration receives the full shared
    # battery at the actual complete schema boundary used by the checker.
    envelope_schema=json.loads((ROOT/'Plans/event_record.schema.json').read_text())
    checkpoints=json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    for f in FAMILIES:
        if family and f!=family:continue
        for edition in ('project','application'):
            base=originals[f+'/'+edition][0]
            payload_schema=json.loads((ROOT/rows[f]['payload_schema_ref']).read_text())
            for field,definition,value,profile,uppercase in [
                ('ts',payload_schema,base['result'],EVENT_RECORD,True),
                ('occurred_at_utc',envelope_schema,base['record'],EVENT_RECORD,False),
                ('observed_at_utc',envelope_schema,base['record'],STORAGE_UTC_Z,False),
                ('persisted_at_utc',envelope_schema,base['record'],STORAGE_UTC_Z,False)]:
                actual_validator=validator(definition)
                for sample in samples:
                    val=sample['value'];reason=None
                    try:date_time(val,profile=profile);wanted=True
                    except Refusal as e:wanted=False;reason=e.reason
                    wanted=wanted and (not uppercase or type(val) is str and val.endswith('Z'))
                    got=m.schema_admission({**value,field:val},actual_validator)
                    results.append(dict(family=f,edition=edition,id=sample['id'],field=field,profile=profile,
                        owner_uppercase_Z=uppercase,boundary='complete selected owner schema',expected=wanted,actual=got,shared_reason=reason,pass_=got==wanted))
        cp=next(c for c in checkpoints if c['event_type']==f)
        cv=validator(json.loads((ROOT/cp['schema_ref'].split('#')[0]).read_text()))
        for sample in samples:
            val=sample['value'];reason=None
            try:date_time(val,profile=EVENT_RECORD);wanted=type(val) is str and val.endswith('Z')
            except Refusal as e:wanted=False;reason=e.reason
            candidate=copy.deepcopy(cp['with_history']);candidate['history'][0]['retired_at_utc']=val
            got=m.schema_admission(candidate,cv)
            results.append(dict(family=f,id=sample['id'],field='retired_at_utc',profile=EVENT_RECORD,owner_uppercase_Z=True,
                boundary='complete populated checkpoint schema',expected=wanted,actual=got,shared_reason=reason,pass_=got==wanted))
    # The newly completed receipt boundary also runs every shared uint64 case.
    receipt_numbers=[]
    for f in FAMILIES:
        if family and f!=family:continue
        for edition in ('project','application'):
            ref=f+'/'+edition;base=originals[ref][0]
            for case in corpus:
                if case['op']!='uint64':continue
                val=_value(case['value']);data={ref:[copy.deepcopy(base)]}
                for component in ('receipt','first_receipt'):data[ref][0][component]['byte_offset']=val
                got=m.worktree_event_outcome(base['record'],rows[f],ref,data)
                if 'error' not in case:expected=None
                elif type(val) is int and val>=0 or type(val) is float and val.is_integer() and val>=0:
                    expected=('wt_receipt','WT08_receipt_numbers','worktree_refused')
                else:expected=('sd_complete','SD01_complete_definition','schema_refused')
                receipt_numbers.append(dict(family=f,edition=edition,id=case['id'],shared_error=case.get('error'),expected=expected,actual=got,pass_=got==expected))
    numbers['receipt_uint64']=receipt_numbers
    numbers['status']='pass' if numbers['status']=='pass' and all(r['pass_'] for r in receipt_numbers) else 'fail'
    write(out,'number-corpus.json',numbers)
    dates=dict(status='pass' if all(r['pass_'] for r in results) else 'fail',checks=len(results),
               failures=[r for r in results if not r['pass_']],results=results,
               existing_fields='Complete original rounds 7/8 replay covers payload ts, occurred_at_utc, observed_at_utc, persisted_at_utc and checkpoint retired_at_utc.')
    write(out,'datetime-corpus.json',dates)
    return numbers['status']=='pass' and dates['status']=='pass'


def entailments(out,family=None):
    """Check concrete premises of the seven unchanged ordinary defensive rows."""
    import inspect
    rows={r['event_type']:r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    proofs={
        'SC13_decoded_bytes':dict(phase='sc_project_bytes',proof='SC12 has already strictly decoded the bytes as UTF-8 equal to project_id, whose own strict UTF-8 encoding is exact. Strict valid UTF-8 is injective and encode(decode(bytes))=bytes.'),
        'CP29_value_event_type':dict(phase='cp_family_entailed',proof='CP01 validates the selected complete checkpoint edition before any source family comparisons; every installed edition pins event_type to this exact family.'),
        'CP30_event_event_type':dict(phase='cp_event_family_entailed',proof='The same unchanged event object passed the complete retained reader before this row. That reader calls JN02 with this exact expected family before returning; no intervening write changes the object.'),
        'CP32_consumer':dict(phase='cp_consumer_entailed',proof='CP01 validates the selected complete checkpoint edition, whose consumer_id const equals this exact row reader in every installed edition.'),
        'CP33_projector':dict(phase='cp_projector_entailed',proof='CP01 validates the selected complete checkpoint edition, whose projector_id const equals this exact row domain_projector in every installed edition.'),
        'CS04_pointer_encodable':dict(phase='cs_pointer_bounds',proof='CS06 already requires the exact one-key pointer containing an ASCII reference recomputed from real encoded bytes and their BLAKE3. Such a built-in map and string are always encodable by the current codec.'),
        'CS05_pointer_size':dict(phase='cs_pointer_size_entailed',proof='The exact CS06 pointer has a fixed ASCII prefix, 64 hex digits, a bounded decimal byte length and fixed media suffix. Even a 20-digit uint64 length gives at most 131 physical bytes, below 16384.'),
    }
    for row,item in proofs.items():
        actual=m.table_rows(item['phase'])
        assert len(actual)==1 and actual[0][0]==row,(row,actual)
        item['table']='scripts/pm_dch_table_'+item['phase']+'.py'
    constants=[]
    for f in FAMILIES:
        if family and f!=family:continue
        row=rows[f];path='Plans/dch_event_payloads/dch_'+f.replace('.','_')+'_checkpoint.schema.json'
        editions=[(m.CURRENT_RULE,json.loads((ROOT/path).read_text()))]+[(name,recipe['schemas'][path]) for name,recipe in m.RETAINED_RECIPES.items()]
        for edition,definition in editions:
            for key,expected in [('event_type',f),('consumer_id',row['reader']),('projector_id',row['domain_projector'])]:
                assert definition['properties'][key].get('const')==expected,(f,edition,key)
                constants.append(dict(family=f,edition=edition,schema=path,pointer='/properties/'+key+'/const',value=expected))
    for func in (m._scope_partition,m._historical_read,m._joins,m._checkpoint_joins,m._checkpoint_storage):
        lines,start=inspect.getsourcelines(func)
        for item in proofs.values():item.setdefault('source_pins',[]).append(dict(path='scripts/pm_dch_events.py',function=func.__name__,line=start,
            sha256=hashlib.sha256(''.join(lines).encode()).hexdigest()))
    cp=inspect.getsource(m._checkpoint_joins)
    assert cp.index('_historical_read(event')<cp.index("require('cp_event_family_entailed'")
    physical=inspect.getsource(m._checkpoint_storage)
    assert physical.index("require('cs_pointer'")<physical.index("require('cs_pointer_bounds'")<physical.index("require('cs_pointer_size_entailed'")
    pointer={'payload_ref':'payload:v1:'+'f'*64+':'+str((1<<64)-1)+':application/msgpack'}
    pointer_bytes=len(m.body_bytes(pointer));assert pointer_bytes<=131<m.INLINE_LIMIT
    result=dict(status='pass',scope='ordinary CH1 only; no proof credit is invented for these seven unreachable rows',
        proofs=proofs,const_premises=constants,max_pointer_witness_bytes=pointer_bytes,tool_proved=False)
    write(out,'entailed-singletons.json',result);return True


def replay(out,family=None):
    old=m.SELECTED_FAMILY;m.SELECTED_FAMILY=family
    buf=io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):code=m.main()
    finally:m.SELECTED_FAMILY=old
    report=json.loads(buf.getvalue());write(out,'original-suite.json',report)
    if family is None:
        import pm_dch_stop as stop
        buf=io.StringIO()
        with contextlib.redirect_stdout(buf):stop_code=stop.main()
        stop_report=json.loads(buf.getvalue());write(out,'stop-original-suite.json',stop_report)
        code=code or stop_code
    return not code


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--out',type=Path,required=True);p.add_argument('--family',choices=FAMILIES)
    p.add_argument('--part',action='append',choices=['source','schema','retained','corpora','replay','entailments'])
    a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);pins=manifest();write(a.out,'source-pins.json',pins)
    parts=a.part or ['source','schema','retained','corpora','replay'];outcomes={}
    for part in parts:
        print('CH1 '+part,flush=True)
        if part=='schema':
            from pm_dch_schema_coverage import run
            result=run(m,a.family);write(a.out,'schema-coverage.json',result)
            unresolved=[dict(boundary=b['id'],path=s['path'],classification=s['classification'])
                        for b in result['boundaries'] for s in b['inventory'] if s['classification'] in ('unvisited','needs_cover')]
            write(a.out,'schema-unresolved.json',unresolved);outcomes[part]=not unresolved
        else:outcomes[part]=globals()[dict(source='source_witnesses').get(part,part)](a.out,a.family)
        print(part+' '+('PASS' if outcomes[part] else 'FAIL'),flush=True)
    if manifest()!=pins:raise AssertionError('input sources changed during run')
    summary=dict(status='pass' if all(outcomes.values()) else 'fail',parts=outcomes,source_pins='source-pins.json',native_execution='NOT_RUN')
    write(a.out,'summary.json',summary);print(json.dumps(summary));return summary['status']!='pass'


if __name__=='__main__':raise SystemExit(main())
