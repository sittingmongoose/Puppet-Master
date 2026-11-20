#!/usr/bin/env python3
"""DS round-four complete-entry regressions; synthetic, never native/seal proof."""
from __future__ import annotations
import argparse
import base64
import copy
import json
from pathlib import Path
from unittest.mock import patch
import pm_event_authority_ds_round2 as ds
import pm_event_authority_ds_round3 as d3
import pm_home_layout_v2_slot_receipt as home
import pm_event_payload_route as route


def home_errors(checker, definition, value, store):
    errors = checker.schema_errors(definition, value)
    return errors or checker.semantic(definition, value, store)


def source_copy(slot, which, path, value):
    """One contradictory source fact; every physical/observational pin follows it."""
    changed = copy.deepcopy(slot)
    source = which + '_layout_source_bytes'
    layout = json.loads(base64.b64decode(changed[source]['bytes']))
    target = layout
    for part in path[:-1]:
        target = target[part]
    target[path[-1]] = value
    data = home.source_json(layout)
    changed[source]['bytes'] = base64.b64encode(data).decode()
    changed[which + '_layout_sha256'] = home.sha(data)
    if which == 'candidate' and changed['readback'] is not None:
        changed['readback']['layout_sha256'] = home.sha(data)
    return changed


def source_numeric_copy(slot,which,spelling):
    """Preserve the supplied numeric lexeme in the captured original bytes."""
    changed=copy.deepcopy(slot);source=which+'_layout_source_bytes'
    data=base64.b64decode(changed[source]['bytes'])
    original=slot[which+'_layout']['revision']
    needle=('"revision":'+str(original)+',').encode()
    assert data.count(needle)==1
    replacement=('"revision":'+str(original)+spelling+',').encode()
    data=data.replace(needle,replacement)
    changed[source]['bytes']=base64.b64encode(data).decode()
    changed[which+'_layout_sha256']=home.sha(data)
    if which=='candidate' and changed['readback'] is not None:changed['readback']['layout_sha256']=home.sha(data)
    return changed


def build():
    suite = ds.Suite()
    compaction=ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']
    for context in ('false','true',0,1,None,[],{}):
        suite.negative('round4:compaction_historical_type:'+repr(context),'compaction_historical_type',
                       lambda value=context:not ds.compaction_event_errors(compaction,historical=value))
    slot, event = d3.layout_base()
    checker = home.Checker(ds.ROOT)
    store = home.PayloadStore.from_fixture(ds.load(home.FIXTURES)['payload_store'])
    suite.positive('round4:home4_valid_source', lambda: not home_errors(checker, 'transaction_slot', slot, store))
    for which in ('prior', 'candidate'):
        for token in ('1.0', '1e0'):
            changed = source_numeric_copy(slot,which,token[1:])
            suite.negative('round4:source:' + which + ':revision:' + token,
                           'home4_typed_source_copy',
                           lambda v=changed: not home_errors(checker, 'transaction_slot', v, store))
        original = slot[which + '_layout']['tabs']['dashboard:agents']['pinned']
        changed = source_copy(slot, which, ['tabs', 'dashboard:agents', 'pinned'], int(original))
        suite.negative('round4:source:' + which + ':boolean_as_integer',
                       'home4_typed_source_copy',
                       lambda v=changed: not home_errors(checker, 'transaction_slot', v, store))
        for path in (['revision'],['tabs','dashboard:agents','pinned']):
            current=slot[which+'_layout']
            for key in path:current=current[key]
            text=str(current).lower() if type(current) is bool else str(current)
            for value in (text,None,[],{'nested':current}):
                changed=source_copy(slot,which,path,value)
                suite.negative('round4:source:'+which+':wrong_type:'+':'.join(path)+':'+repr(value),
                    'home4_typed_source_copy',lambda v=changed:not home_errors(checker,'transaction_slot',v,store))

    # These are original retained bytes; the new writer is deliberately not used
    # to manufacture a record whose original recipe allowed integral floats.
    large = copy.deepcopy(event)
    large['payload'] = ds.padded(event['payload'], 16385, 'affected_tab_ids')
    for field in ('prior_layout_revision', 'new_layout_revision'):
        large['payload'][field] = float(large['payload'][field])
    retained, objects = d3.invalid_external_numeric(large)
    frozen = copy.deepcopy(objects)
    observation = ds.layout_history_observation(retained)
    binding = slot['binding']
    def historical(e=retained, obj=objects, obs=observation):
        return not ds.layout_event_errors(e, obj, binding=binding, historical=True, **obs)
    suite.positive('round4:layout_retained_numeric', historical)
    def home_history():
        errors = []
        body = home.event_checks(errors, retained, binding, home.digest(binding), home.PayloadStore(objects),
                                 historical=True, **observation)
        return not errors and type(body['prior_layout_revision']) is float and objects == frozen
    suite.positive('round4:home_event_retained_numeric', home_history)
    suite.negative('round4:layout_numeric_current_writer', 'integral_numeric_type',
                   lambda: not ds.layout_event_errors(retained, objects, binding=binding))
    # SP-1101 (part 2B): one original has one sealed write recipe, and the reader's named recipe selects nothing.
    # The strict case is therefore its own original, sealed under typed-integer by the custody builder.
    # (Its own bytes: the same event with only prior_layout_revision an integral float; the event id stays
    # the one the operation digest forms.)
    strict_large = copy.deepcopy(large)
    strict_large['payload']['new_layout_revision'] = int(strict_large['payload']['new_layout_revision'])
    strict_event, strict_objects = d3.invalid_external_numeric(strict_large)
    strict = ds.layout_history_observation(strict_event, 'workspace-layout-v2/typed-integer')
    suite.positive('round4:strict_recorded_recipe_refuses_float', lambda: not historical(e=strict_event, obj=strict_objects, obs=strict))
    for field in ('event_id', 'idempotency_key', 'project_id'):
        changed = copy.deepcopy(retained)
        changed[field] += '-forged'
        suite.positive('round4:retained_source_forgery:' + field,
                       lambda e=changed: not historical(e=e))
    changed = copy.deepcopy(observation)
    changed['historical_source']['payload_validation_recipe'] = 'workspace-layout-v2/typed-integer'
    suite.positive('round4:recipe_not_selected_by_caller', lambda: not historical(obs=changed))
    suite.positive('round4:retained_source_missing', lambda: not historical(obs={'custody': observation['custody']}))
    suite.positive('round4:retained_body_unavailable', lambda: not historical(obj={}))
    for flag in ('source_verified', 'access_allowed', 'deletion_allows_audit', 'checkpoint_read_token_valid'):
        changed = copy.deepcopy(observation)
        changed['custody'][flag] = False
        suite.negative('round4:retained_custody:' + flag, 'layout_history_custody',
                       lambda obs=changed: historical(obs=obs))
    # Foreign *verified* source still cannot join a different binding.
    foreign = copy.deepcopy(large)
    foreign['project_id'] = foreign['payload']['project_id'] = 'project-foreign'
    foreign, foreign_objects = d3.invalid_external_numeric(foreign)
    suite.positive('round4:verified_foreign_layout_refused', lambda: not historical(
        foreign, foreign_objects, ds.layout_history_observation(foreign)))
    return suite


def format_sweep():
    """Actual family entries enforce formats; the closed terminal schema is read-only."""
    from pm_browser_workspace_created import creation_preflight_failures
    from pm_browser_workspace_reset import reset_preflight_failures
    _, _, browser = d3.bases()
    slot, event = d3.layout_base()
    compaction = ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']
    rows = []
    malformed = ['2026-09-10T00:00:00', '2026/09/10T00:00:00Z', '2026-13-10T00:00:00Z',
                 '2026-02-30T00:00:00Z', '2026-09-10T24:00:00Z', '2026-09-10T00:60:00Z',
                 '2026-09-10T00:00:60Z', '2026-09-10T00:00:00Z\n', '2026-09-10T00:00:00.Z']
    checks = [
        ('context.compaction.completed', compaction, lambda e: ds.compaction_event_errors(e)),
        ('workspace.layout_changed', event, lambda e: ds.layout_event_errors(e, binding=slot['binding'])),
    ]
    for model, base in browser:
        check = creation_preflight_failures if model.EVENT_TYPE.endswith('created') else reset_preflight_failures
        checks.append((model.EVENT_TYPE, base['event'], lambda e, b=base, f=check: f(**{**b, 'event': e})))
    for family, original, check in checks:
        assert not check(original), family
        for field in ('occurred_at_utc', 'observed_at_utc', 'persisted_at_utc'):
            for value in malformed:
                changed = copy.deepcopy(original)
                changed[field] = value
                if family=='context.compaction.completed' and field=='occurred_at_utc':
                    changed['payload']['committed_at_utc']=value
                errors = check(changed)
                rows.append({'family': family, 'field': field, 'value': value, 'refused': bool(errors), 'errors': errors})
    schema_rows=[]
    paths={home.SCHEMA,*home.REFERENCED,'Plans/event_record.schema.json','Plans/event_record_v3.schema.json',
           'Plans/browser_event_payloads.schema.json','Plans/section15_browser_program_contracts.schema.json',
           'Plans/browser_workspace_created_contracts.schema.json','Plans/browser_workspace_created_checkpoint_v2.schema.json',
           'Plans/browser_workspace_reset_contracts.schema.json','Plans/event_payload_context_compaction_completed.schema.json',
           'Plans/event_payloads/terminal_workgroup_moved.schema.json'}
    seen=set()
    from pm_contract_formats import FormatChecker
    # Full family entries above own their exact eager reference closure. Here
    # validate each format-bearing field node, without selecting unrelated roots
    # of a shared application resource as a new DS contract.
    selected=home.Home4Validator({},registry=home.Checker(ds.ROOT).registry,format_checker=FormatChecker())
    def visit(path):
        if path in seen:
            return
        seen.add(path)
        schema=ds.load(path)
        def walk(value,pointer=''):
            if isinstance(value,dict):
                if 'format' in value:
                    fmt=value['format']
                    if fmt not in selected.format_checker.checkers:
                        raise AssertionError('silently skipped format: '+path+pointer+':'+fmt)
                    bad=malformed if fmt=='date-time' else ['not-a-uuid','11111111-1111-4111-8111-111111111111\n']
                    for candidate in bad:
                        errors=list(selected.evolve(schema=value).iter_errors(candidate))
                        schema_rows.append({'path':path,'pointer':pointer,'format':fmt,'value':candidate,'refused':bool(errors)})
                for key,child in value.items():
                    walk(child,pointer+'/'+key.replace('~','~0').replace('/','~1'))
            elif isinstance(value,list):
                for i,child in enumerate(value):
                    walk(child,pointer+'/'+str(i))
        walk(schema)
    for path in sorted(paths):
        visit(path)
    from pm_contract_formats import date_time_ok
    retained_forms=['2026-09-10T00:00:00.123456789Z','2026-09-10T01:00:00.123456789123+01:00',
                    '2026-09-10t00:00:00z','1990-12-31T23:59:60Z','1990-12-31T15:59:60-08:00']
    positives={v:date_time_ok(v) for v in retained_forms}
    return {'status': 'pass' if all(r['refused'] for r in rows+schema_rows) and all(positives.values()) else 'fail',
            'rows':rows,'schema_format_rows':schema_rows,'retained_format_positives':positives,
            'schema_resources':sorted(seen),'terminal':'Closed retained payload has no formats; its shared EventRecord formats are enforced. No disclosure permission or operating consumer inferred.',
            'reference':'https://www.rfc-editor.org/rfc/rfc3339.html#section-5.7',
            'note':'Full current entries plus every declared date-time/uuid node in the exact owner resources; no optional format dependency. Original spellings/precision remain unchanged.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    result = build().run()
    result['format_sweep'] = format_sweep()
    if result['format_sweep']['status'] != 'pass':
        result['status'] = 'fail'
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: result[k] for k in ('status', 'positive_count', 'negative_count', 'failures')}, indent=2))
    return result['status'] != 'pass'


if __name__ == '__main__':
    raise SystemExit(main())
