"""Single-copy witnesses for adopted historical helper predicates; TEST_ONLY."""
import copy
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c
import pm_goal_own_d_oracles as d


def main():
    collector=tables.COLLECTOR
    if collector is None:raise RuntimeError('Run through pm_goal_guard_sweep.py')
    start=len(collector.failures)
    suite=d.ReaderOracles();key='child_status'
    fixture=c.load(d.PLANS/'goal_child_status_history_contract_fixtures.json')
    base=next(x['input'] for x in c.materialize_cases(fixture['protocol_cases']) if x['valid'])
    base=d.provenance_original(key,base)
    store=d.logical_store(key,base)
    for stage in d.STAGES:
        def evaluate(value,s=stage):return suite._guarded(s,key,value['presented'],value['store'])
        value=dict(presented=copy.deepcopy(base),store=copy.deepcopy(store))
        collector.invoke('own-d-supplement/'+stage+'/control',evaluate,value,True)
        for defect,expected in [('source','source/full_original'),('edition','admission/accepted_edition'),
                                ('checkpoint','admission/approved_checkpoint'),('receipt','retained/verified_original')]:
            value=dict(presented=copy.deepcopy(base),store=copy.deepcopy(store))
            p,s=value['presented'],value['store']
            if defect=='source':
                s['source']['event']['actor_ref']+=':other'
                p['source']['event']=copy.deepcopy(s['source']['event'])
            elif defect in ('edition','checkpoint'):
                field='owner_unit' if defect=='edition' else 'registry_checkpoint'
                p['original']['admission'][field]+=':other'
                s['protocol']['original']['admission'][field]=p['original']['admission'][field]
            else:
                s['custody']['first_append_receipt']['acknowledged_at_utc']='2026-11-14T12:00:00Z'
            result=collector.invoke('own-d-supplement/'+stage+'/'+defect,evaluate,value,False)
            if set(result['errors'])!={expected}:
                collector.failures.append(dict(case=stage+'/'+defect,expected=expected,actual=result['errors']))
    return int(len(collector.failures)>start)
