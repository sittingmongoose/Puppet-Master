"""Schema-only capacity-reader compatibility; synthetic metadata, zero native."""
import importlib.util
import hashlib
import json
from pathlib import Path
import tempfile

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

reader=load('_er9_v15_acceptance',HERE/'service_acceptance_projection.py')
with tempfile.TemporaryDirectory(prefix='er9-v15-capacity-reader-') as temp:
    root=Path(temp);thread='11111111-1111-1111-1111-111111111111'
    value={'schema':'er9.luna.client-dynamic-stage.v1.5-clock-telemetry','thread_id':thread,
        'original_birth_monotonic_ns':100,'native_stop_monotonic_ns':1000,'requested_model':'gpt-6-luna',
        'requested_effort':'max','model_fallback_allowed':False,'identity':{'fresh_empty_history':True,'instruction_sources_empty':True,'model':'gpt-6-luna','effort':'max'},
        'runtime_source_sha256':{'dynamic_projector.py':reader.PROJECTOR_SHA},'prospective_completion_source_sha256':{'projection.py':reader.TAIL_PROJECTOR_SHA},
        'allowed_client_tools':{'pm_boundary':['read_file']},'metrics':{'fresh_session':True,'goal_target_id':thread,'requested_model':'gpt-6-luna','requested_effort':'max',
            'goal_started_turn':True,'goal_status_final':'active','candidate_goals_set_by_host':1,'host_initial_turns_started':1,'host_followup_turns_started':0,'goal_replacements_observed':0,
            'activation':{'native_activation_observed':True,'receipt_id':thread,'observed_activation_monotonic_ns':110},'usage_notification_count':1,
            'usage_totals':{'inputTokens':100,'cachedInputTokens':80,'outputTokens':5,'reasoningOutputTokens':3,'totalTokens':105},'tool_completed_counts':{'pm_boundary.read_file':1}}}
    (root/'result.json').write_text(json.dumps(value));sessions=root/'host-private/codex-home/sessions';sessions.mkdir(parents=True)
    (sessions/'fixture.jsonl').write_text(json.dumps({'type':'session_meta','payload':{'id':thread}})+'\n')
    result=reader.extract(root,100,thread,200);assert result['active_attempt_acceptance_observed']
    assert result['native_parent_response_count'].startswith('UNKNOWN')
    value['metrics']['usage_totals']['outputTokens']=0;(root/'result.json').write_text(json.dumps(value))
    assert not reader.extract(root,100,thread,200)['active_attempt_acceptance_observed']
receipt={'schema':'er9.luna.v15-capacity-reader-schema-compatibility.v1','status':'PASS','checks':2,'native_goal_starts':0,
    'reader_predicate':'unchanged; only schema/import-path compatibility','test_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
(HERE/'SERVICE_ACCEPTANCE_REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
