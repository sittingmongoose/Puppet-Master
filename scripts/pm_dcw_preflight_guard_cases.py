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


def invoke(witness):
    original_load=m.load;original_cases=numeric.cases;value=witness['value']
    replacements={**value['replacements'],'Plans/dcw_event_contract_fixtures.json':value['fixtures'],
                  'Plans/storage_value_registry.json':value['registry']}
    m.load=lambda p:replacements[p] if p in replacements else original_load(p)
    numeric.cases=lambda row:[]
    try:
        with redirect_stdout(io.StringIO()):m.run(legacy.validate,value['family'])
        return 'accept'
    finally:
        m.load=original_load;numeric.cases=original_cases
