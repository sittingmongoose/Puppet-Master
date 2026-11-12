"""Full CLI preflight witnesses; the case bank is shortened, no guard is cut."""
import copy
import io
from contextlib import redirect_stdout

import pm_dcw_event_oracles as m
import pm_dcw_event_numeric_cases as numeric
import pm_bundle_revision_events as legacy


def cases():
    fixtures=copy.deepcopy(m.load('Plans/dcw_event_contract_fixtures.json'))
    for row in fixtures['families']:
        row['cases']=[next(c for c in row['cases'] if c['case_id']=='valid_retry')]
    registry=copy.deepcopy(m.load('Plans/storage_value_registry.json'))
    family=fixtures['families'][0]['event_type']
    def value(label, f=fixtures, r=registry, selected=family, replacements=None, expected='accept'):
        return dict(id='preflight/'+label,family='CLI preflight',row=None,kind='preflight',operation='CLI',
            value=dict(fixtures=copy.deepcopy(f),registry=copy.deepcopy(r),family=selected,
                       replacements=replacements or {}),expected=expected)
    yield value('control')
    missing=copy.deepcopy(fixtures);missing['families'][-1]=copy.deepcopy(missing['families'][-2])
    yield value('missing-name-same-count',f=missing,expected='family_inventory')
    extra=copy.deepcopy(fixtures);extra['families'].append(copy.deepcopy(extra['families'][-1]))
    yield value('extra-row-same-names',f=extra,expected='family_inventory')
    yield value('foreign-selection',selected='not.a.family',expected='family_inventory')
    source_family=fixtures['families'][0]['source_family']
    for section,key,bad,expected in [(None,'status','deferred','materialized_source'),
            (None,'value_schema_ref','Plans/foreign.schema.json','materialized_source'),
            (None,'value_schema',{},'materialized_source'),
            ('recovery_disposition','backup_required',False,'original_backup_contract'),
            ('restore_disposition','mutation_fence_on_unresolved',False,'original_backup_contract'),
            ('restore_disposition','mode','not_mandatory','original_backup_contract')]:
        changed=copy.deepcopy(registry);source=next(s for s in changed['families'] if s['family_id']==source_family)
        (source[section] if section else source)[key]=bad
        yield value(key,r=changed,expected=expected)
    path=fixtures['families'][0]['source_schema'];document=copy.deepcopy(m.load(path))
    for label,ref in [('unused-local-ref','#/$defs/DCW_MISSING'),('unused-external-ref','urn:pm:dcw:missing-resource')]:
        changed=copy.deepcopy(document);changed['$defs']['unvisited_guard_probe']={'$ref':ref}
        yield value(label,replacements={path:changed},expected='unresolved_schema_ref')

    # Schema-data equality has no EventRecord/MessagePack integer ceiling.
    # Both copies must still match exactly when an annotation carries a huge int.
    huge=m.numbers.loads_current_json('9'*4400)
    for label,annotation,expected in [('huge-schema-control',huge,'accept'),
                                      ('huge-schema-mismatch',huge+1,'materialized_source')]:
        owner=copy.deepcopy(m.load(path));owner['x-proof-number']=huge
        changed=copy.deepcopy(registry)
        next(r for r in changed['families'] if r['family_id']==source_family)['value_schema']=dict(owner,**{'x-proof-number':annotation})
        yield value(label,r=changed,replacements={path:owner},expected=expected)

    import pm_dcw_blockage_events as blockage
    from pm_dcw_blockage_fixtures import base
    blocked=m.load(blockage.FIXTURES)['families'][0]
    control=base(blocked['event_type'])
    def blockage_value(label, section=None, key=None, bad=None, expected='accept'):
        changed=copy.deepcopy(registry)
        source=next(r for r in changed['families'] if r['family_id']==blocked['source_family'])
        if key:(source[section] if section else source)[key]=bad
        return dict(id='blockage-preflight/'+label,family='Blockage CLI preflight',row=None,
            kind='preflight',operation='CLI',expected=expected,value=dict(blockage=True,
            family=blocked['event_type'],registry=changed,replacements={},control=control))
    yield blockage_value('control')
    for label,section,key,bad,expected in [
        ('schema-ref',None,'value_schema_ref','Plans/foreign.schema.json','materialized_source'),
        ('schema-value',None,'value_schema',{},'materialized_source'),
        ('backup','recovery_disposition','backup_required',False,'backup_contract'),
        ('fence','restore_disposition','mutation_fence_on_unresolved',False,'backup_contract')]:
        yield blockage_value(label,section,key,bad,expected)


def invoke(witness):
    original_load=m.load;original_cases=numeric.cases;value=witness['value']
    if value.get('blockage'):
        import pm_dcw_blockage_events as blockage
        import pm_dcw_blockage_fixtures as fixtures
        saved=fixtures.cases
        m.load=lambda p:value['registry'] if p=='Plans/storage_value_registry.json' else original_load(p)
        fixtures.cases=lambda row:[dict(id='preflight-control',value=value['control'],operation='publish',expected='accept')]
        try:
            with redirect_stdout(io.StringIO()):blockage.main(value['family'])
            return 'accept'
        finally:m.load=original_load;fixtures.cases=saved
    replacements={**value['replacements'],'Plans/dcw_event_contract_fixtures.json':value['fixtures'],
                  'Plans/storage_value_registry.json':value['registry']}
    m.load=lambda p:replacements[p] if p in replacements else original_load(p)
    numeric.cases=lambda row:[]
    try:
        with redirect_stdout(io.StringIO()):m.run(legacy.validate,value['family'])
        return 'accept'
    finally:
        m.load=original_load;numeric.cases=original_cases
