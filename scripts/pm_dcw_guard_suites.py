"""DCW complete-path witnesses and Method B phase suites.

The original full append/retry/history/index paths derive each phase observation.
The proof boundary is that original table, not the whole Python CLI. Untracked
exceptions, missing witnesses and complete-path cuts that still refuse stay in
reported evidence and earn no complete-boundary credit.
"""
import copy
import importlib
import pickle
from pathlib import Path

import pm_guard_isolation as g
import pm_dcw_event_oracles as m
import pm_dcw_guard_rows as rows
import pm_bundle_revision_events as legacy
import pm_dcw_blockage_events as blockage
from pm_dcw_event_numeric_cases import cases as numeric_cases
from pm_dcw_event_regressions import scenario
from pm_dcw_blockage_fixtures import cases as blockage_cases

ROOT = Path(__file__).resolve().parents[1]


def witnesses(family=None):
    from pm_dcw_legacy_guard_cases import cases as legacy_cases
    yield from legacy_cases(family)
    for row in m.load('Plans/dcw_event_contract_fixtures.json')['families']:
        if family and row['event_type'] != family:
            continue
        for case in [*row['cases'], *numeric_cases(row)]:
            value = copy.deepcopy(case['_value']) if '_value' in case else scenario(row, case)
            yield dict(id=row['event_type'] + '/' + case['case_id'], family=row['event_type'], row=row,
                       value=value, operation=case['operation'], expected=case['expected'])
        for field in row['positive']['event']['payload']:
            value = copy.deepcopy(row['positive']); del value['event']['payload'][field]
            yield dict(id=row['event_type']+'/required_payload/'+field, family=row['event_type'], row=row,
                       value=value, operation='publish', expected='schema')
        for field in row['positive']['event']:
            value = copy.deepcopy(row['positive']); del value['event'][field]
            yield dict(id=row['event_type']+'/required_envelope/'+field, family=row['event_type'], row=row,
                       value=value, operation='publish', expected='schema')
    for row in m.load(blockage.FIXTURES)['families']:
        if family and row['event_type'] != family:
            continue
        for case in blockage_cases(row):
            yield dict(id=row['event_type']+'/'+case['id'], family=row['event_type'], row=None,
                       value=case['value'], operation=case['operation'], expected=case['expected'])
            if case['expected'] != 'accept':
                yield dict(id=row['event_type']+'/'+case['id']+'/repair', family=row['event_type'], row=None,
                           value=case['repair'], operation=case['operation'], expected='accept')


def number_witnesses(family=None):
    from pm_dcw_blockage_fixtures import base
    from pm_dcw_event_fixtures import event_slots
    from pm_dcw_index_fixtures import snapshot
    families=[(r, r['positive']) for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']]
    families += [(None, base(name)) for name in blockage.NAMES]
    for row, positive in families:
        name=positive['event']['event_type']
        if family and family!=name:continue
        huge=copy.deepcopy(positive);huge['event']['sequence_id']=m.numbers.loads_current_json('9'*4400)
        yield dict(id=name+'/numbers/current-sequence-4400',family=name,row=row,value=huge,operation='publish',expected='integer_range')
        live=copy.deepcopy(positive)
        cp=live['index']['checkpoint'];cp['generations'][cp['current_generation_id']]['frontier']['publication_revision']=1.0
        yield dict(id=name+'/numbers/live-checkpoint-float',family=name,row=row,value=live,operation='read',expected='schema')
        value=copy.deepcopy(positive)
        value['retry_request']=copy.deepcopy(value['event'])
        value['retry_request']['producer_sequence_id']=1.0
        yield dict(id=name+'/numbers/current-integral-float',family=name,row=row,value=value,operation='retry',expected='integer_type')
        from pm_dcw_event_fixtures import writer_policy_fixture
        from pm_dcw_blockage_fixtures import seal
        for policy, expected in [('projector_replay_only','accept'),('append_once','writer_policy' if row is not None else 'historical_policy')]:
            retained=copy.deepcopy(positive)
            if row is not None:
                writer_policy_fixture(row,retained,policy)
            else:
                retained['event']['replay_policy']=policy;seal(retained)
            yield dict(id=name+'/numbers/retained-policy/'+policy,family=name,row=row,value=retained,operation='read',expected=expected)

        value=copy.deepcopy(positive);eid=value['event']['event_id']
        value['event']['observed_at_utc']='2026-11-07T12:00:00Z'
        custody=value['authority']['custody'][eid]
        custody['original_event_value_commitment']=m.commitment(value['event'])
        slots=event_slots(value) if row is not None else [*value['authority']['sources'].values(),value['source']]
        for slot in slots:
            if slot['prepared_event']['event_id']==eid:
                slot['prepared_event']=copy.deepcopy(value['event'])
                slot['original_event_value_commitment']=copy.deepcopy(custody['original_event_value_commitment'])
        value['authority']['events'][eid]=copy.deepcopy(value['event'])
        # Issue the captured index, not an original number-custody record.
        value['index'],value['reader']=snapshot(list(value['authority']['events'].values()),
            value['authority']['storage_instance_id'],value['authority']['recovery_epoch'])
        yield dict(id=name+'/numbers/forged-original-catalog',family=name,row=row,value=value,operation='publish',expected='original_authority')


def invoke(witness):
    if witness.get('kind')=='preflight':
        from pm_dcw_preflight_guard_cases import invoke as preflight
        return preflight(witness)
    value=copy.deepcopy(witness['value'])
    if witness.get('kind')=='legacy':
        with m.original_scope(value.get('passive',False)):
            legacy.validate(witness['row'],value['payload'],value['envelope'],value['previous'])
        return 'accept'
    if witness['row'] is None:
        return blockage.verify(value, witness['operation'])
    return m.verify(witness['row'], value, witness['operation'], legacy.validate)


def collect(family=None, progress=None, items=None):
    collection=dict(controls={}, negatives={}, aliases={}, mismatches=[], untracked=[], cuts=[], counts={})
    from itertools import chain
    from pm_dcw_preflight_guard_cases import cases as preflight_cases
    for w in (items if items is not None else chain(witnesses(family), number_witnesses(family), preflight_cases())):
        recorded=[]; rows.RECORDER=recorded
        try:
            actual=invoke(w)
        except m.Refusal as exc:
            actual=str(exc)
        except Exception as exc:
            collection['untracked'].append(dict(id=w['id'],type=type(exc).__name__,error=str(exc)))
            if len(collection['untracked'])<5:
                import traceback; traceback.print_exc()
            continue
        finally:
            rows.RECORDER=None
        collection['counts'][w['family']]=collection['counts'].get(w['family'],0)+1
        if actual!=w['expected']:
            collection['mismatches'].append(dict(id=w['id'],expected=w['expected'],actual=actual))
        if actual=='accept':
            for name,value,code in recorded:
                if name not in collection['controls']:
                    collection['controls'][name]=dict(id=w['id'],value=value,code=code)
        elif recorded:
            name,value,code=recorded[-1]
            factory=rows.FACTORIES[name]; case=factory(value)
            refusing=[n for n,guard in case.table.guards.items() if guard.predicate(value,case.context) is not None]
            if refusing!=[name]:
                collection['untracked'].append(dict(id=w['id'],error='phase matrix '+repr(refusing)))
                continue
            key=(name,pickle.dumps(value,protocol=5))
            if key in collection['aliases']:
                collection['aliases'][key]['count']+=1
                continue
            entry=dict(id=w['id'],value=value,code=code,count=1)
            collection['negatives'].setdefault(name,[]).append(entry)
            collection['aliases'][key]=entry
            # Supplementary full-boundary diagnostic. No repair or fallback.
            rows.DISABLED=frozenset([name])
            try:
                flip=invoke(w)
            except m.Refusal as exc:
                flip=str(exc)
            except Exception as exc:
                flip=type(exc).__name__
            finally:
                rows.DISABLED=frozenset()
            collection['cuts'].append(dict(id=w['id'],row=name,baseline=actual,cut=flip))
        else:
            collection['untracked'].append(dict(id=w['id'],error='refusal without table observation',actual=actual))
        if progress and sum(collection['counts'].values())%100==0:
            progress(collection)
    collection.pop('aliases')
    return collection


def suite_for(module_name, collection):
    module=importlib.import_module(module_name)
    factory=module.case
    inventory=factory(None).table.guards
    controls=[]; negatives=[]
    for name in inventory:
        control=collection['controls'].get(name)
        if control:
            controls.append(g.Control('control/'+name,control['value'],'synthetic'))
        for index,entry in enumerate(collection['negatives'].get(name,[])):
            negatives.append(g.Negative('negative/'+name+'/'+str(index),entry['value'],name,'refused',
                control='control/'+name if control else None,
                defect=entry['id']))
    relative='scripts/'+module_name+'.py'
    return g.Suite(module_name,factory,controls,negatives,[str(ROOT/relative)],ROOT,
        non_guards=[g.NonGuard(relative,'case','return','return g.Case(table, check, context)',
            'Return the fresh table execution object; the check function itself returns literal True.')])
