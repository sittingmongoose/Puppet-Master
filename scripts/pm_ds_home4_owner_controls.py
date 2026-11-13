"""Original complete Home4 positives and negatives at the full reader entry."""
import copy
import pm_home_layout_v2_slot_receipt as home
import pm_event_authority_ds_round2 as ds


def cases():
    fixtures=ds.load(home.FIXTURES)
    checker=home.Checker(ds.ROOT)
    store=home.PayloadStore.from_fixture(fixtures['payload_store'])
    valid={c['id']:c for c in fixtures['valid']}
    rows=[]
    def errors(definition,value,objects):
        shape=checker.schema_errors(definition,value)
        return shape or checker.semantic(definition,value,objects)
    for case in fixtures['valid']:
        def broken(c=case):
            try:return bool(errors(c['definition'],copy.deepcopy(c['value']),store))
            except Exception:return True
        rows.append(('VALID_HOME4_ROUTE:'+case['id'],broken))
    for negative in fixtures['invalid']:
        base=valid[negative['base']]
        value=home.apply_ops(base['value'],negative['ops'])
        objects=store.apply(negative.get('payload_store_ops',[]))
        def accepted(d=base['definition'],v=value,s=objects):
            # An exception propagates to the audit and is not acceptance.
            return not errors(d,copy.deepcopy(v),s)
        rows.append(('ORIGINAL_HOME4_NEGATIVE:'+negative['id'],accepted))
    expected_sizes={c['id']:len(home.stored_bytes(c['definition'],c['value'])) if c['definition'] in home.FAMILY else len(home.canonical_msgpack(c['value'])) for c in fixtures['valid']}
    def valid_run():
        try:
            result=home.run(ds.ROOT,copy.deepcopy(fixtures))
            return result['status']!='pass' or result['counts']!={'positive':10,'schema_negative':30,'invariant_negative':33} or result['valid_stored_value_bytes']!=expected_sizes
        except Exception:return True
    rows.append(('VALID_HOME4_RUN:counts_and_physical_sizes',valid_run))
    empty=valid['home4_empty_slot']['value']
    def absent_source():
        try:
            found=[]
            home.source_bytes_check(found,'candidate_layout_source_bytes',empty,None,None,home.EMPTY_STORE)
            return bool(found)
        except Exception:return True
    rows.append(('VALID_HOME4_ROUTE:optional_source_absent',absent_source))
    prepared=copy.deepcopy(valid['home4_committed_receipt']['value'])
    prepared.update(state='prepared',append_result=None,source_durability_ref=None,terminal_at_utc=None,
                    original_append_receipt=None,original_publication=None)
    prepared['owner_result'].update(event_status='pending',event_ref=None)
    prepared['dispatch_receipt']['event_ref']=None;prepared['original_ui_response']['event_refs']=[]
    from pm_ds_home4_isolating import refresh_receipt
    refresh_receipt(prepared)
    for field in ('ui_response','command_outcome'):
        value=copy.deepcopy(prepared)
        value['original_'+field]=None
        value['identity_capture_bytes'][field]=None;value['identity_capture_bytes_sha256'][field]=None
        def absent_capture(v=value):
            try:return bool(errors('operation_receipt',v,store))
            except Exception:return True
        rows.append(('VALID_HOME4_ROUTE:optional_capture_absent:'+field,absent_capture))
    return rows
