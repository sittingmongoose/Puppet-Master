"""Zero-inference privacy/identity/error-class tests of actual additive reader."""
import json
from pathlib import Path
import tempfile
from native_error_projection import classify,extract,CAPACITY_MESSAGE


def main():
    checks={}
    assert classify({'message':CAPACITY_MESSAGE,'codex_error_info':'server_overloaded'})['cause_class']=='service_capacity'
    checks['exact_service_capacity_code']=True
    for code,kind in (('usage_limit_reached','account_quota'),('auth_error','authentication'),('permission_denied','permission')):
        assert classify({'codex_error_info':code,'message':'PRIVATE_CONTEXT'})['cause_class']==kind
    checks['quota_auth_permission_codes']=True
    private='PRIVATE_SOURCE_OR_TOKEN_SENTINEL';unknown=classify({'message':private,'codex_error_info':'private_secret_code','additional_details':private})
    assert unknown['cause_class']=='UNKNOWN' and private not in json.dumps(unknown) and 'private_secret_code' not in json.dumps(unknown)
    checks['unknown_message_code_context_hashed_only']=True
    with tempfile.TemporaryDirectory(prefix='er9-error-meta-') as temp:
        root=Path(temp);thread='11111111-1111-1111-1111-111111111111'
        (root/'result.json').write_text(json.dumps({'thread_id':thread}))
        sessions=root/'host-private/codex-home/sessions';sessions.mkdir(parents=True)
        rows=[{'type':'session_meta','payload':{'id':thread}},
            {'type':'response_item','payload':{'role':'assistant','content':private}},
            {'type':'event_msg','payload':{'type':'agent_message','message':private}},
            {'type':'event_msg','timestamp':'2026-10-05T00:00:00Z','payload':{'type':'task_complete',
             'last_agent_message':private,'error':{'message':CAPACITY_MESSAGE,'codex_error_info':'server_overloaded'},'duration_ms':2}}]
        (sessions/'owned.jsonl').write_text('\n'.join(json.dumps(v) for v in rows)+'\n')
        other=[{'type':'session_meta','payload':{'id':'22222222-2222-2222-2222-222222222222'}},rows[-1]]
        (sessions/'other.jsonl').write_text('\n'.join(json.dumps(v) for v in other)+'\n')
        projection=extract(root,thread)
        assert len(projection['errors'])==1 and private not in json.dumps(projection)
        checks['exact_session_identity_candidate_bodies_omitted']=True
        assert projection['errors'][0]['event_timestamp']=='2026-10-05T00:00:00Z' and projection['errors'][0]['receipt_sha256']
        checks['event_timestamp_and_receipt_hash']=True
        try:extract(root,'33333333-3333-3333-3333-333333333333')
        except ValueError:checks['foreign_expected_identity_rejected']=True
        else:raise AssertionError('foreign identity accepted')
    assert all(checks.values())
    result={'schema':'er9.luna.native-error-projection-regression.v1','status':'PASS',
        'actual_native_goals':0,'inference_started':False,'candidate_source_context_used':False,'checks':checks}
    Path(__file__).with_name('NATIVE_ERROR_PROJECTION_REGRESSION.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))


if __name__=='__main__':main()
