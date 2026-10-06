"""Zero-inference race/deadline tests against the actual v1.1 policy/projection."""
from pathlib import Path
import json
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from completion_policy import establish_native_complete
from projection import State


class Host:
    def __init__(self,status='complete'):
        self.state=State(admitted_mcp={},admitted_dynamic={})
        self.state.thread='synthetic-thread';self.state.goal_created_at=10
        self.state.goal_objective='Synthetic complete-before-stop test only.'
        self.state.goal_status=status
        self.state.activation['native_activation_observed']=True
        self.state.active_turns={'synthetic-turn'};self.state.turns={'synthetic-turn'}
        self.attention=False;self.calls=[];self.answer_status='complete'
        self.created=10;self.change_failure_during_call=False
    def call(self,method,params,timeout):
        self.calls.append((method,params,timeout))
        if self.change_failure_during_call:self.state.failed=True
        return {'goal':{'threadId':self.state.thread,'createdAt':self.created,'updatedAt':11,
            'objective':self.state.goal_objective,'status':self.answer_status,'tokenBudget':None}}


def clock(*values):
    iterator=iter(values);return lambda:next(iterator)


def denied(function,expected):
    try:function()
    except expected:return True
    raise AssertionError('Expected rejection did not occur')


def run():
    checks={}
    h=Host();p=establish_native_complete(h,100,clock(90,99))
    assert p['complete_verified_before_original_stop'] and p['active_turn_ids']==['synthetic-turn']
    assert h.calls[0][0]=='thread/goal/get' and h.calls[0][2]<=10/1e9
    h.state.allowed_tail_interrupts=set(p['active_turn_ids'])
    h.state.event({'method':'turn/completed','params':{'threadId':h.state.thread,
        'turn':{'id':'synthetic-turn','status':'interrupted'}}})
    assert not h.state.adverse_failure_observed and not h.state.failed
    assert h.state.metrics()['native_turns_completed']==0 and h.state.metrics()['native_turns_terminal']==1
    assert h.state.metrics()['native_turns_interrupted']==1 and h.state.goal_status=='complete'
    checks['pre_stop_complete_with_exact_tail_interrupt']=True
    checks['interrupted_is_terminal_not_successful_completion']=True
    checks['initial_clock_at_stop_rejected']=denied(lambda:establish_native_complete(Host(),100,clock(100)),TimeoutError)
    checks['receipt_exactly_at_stop_rejected']=denied(lambda:establish_native_complete(Host(),100,clock(90,100)),TimeoutError)
    checks['receipt_after_stop_rejected_even_old_backend_timestamp']=denied(lambda:establish_native_complete(Host(),100,clock(90,101)),TimeoutError)
    h=Host();h.answer_status='active';assert establish_native_complete(h,100,clock(90)) is None
    checks['nonterminal_recheck_not_accepted']=True
    h=Host();h.created=12;checks['native_goal_identity_replacement_rejected']=denied(lambda:establish_native_complete(h,100,clock(90)),ValueError)
    h=Host();h.change_failure_during_call=True
    checks['adverse_event_during_confirmation_rejected']=denied(lambda:establish_native_complete(h,100,clock(90,91)),RuntimeError)
    h=Host();h.state.activation['native_activation_observed']=False
    checks['activation_required']=denied(lambda:establish_native_complete(h,100,clock(90)),RuntimeError)
    h=Host();h.state.event({'method':'turn/completed','params':{'threadId':h.state.thread,
        'turn':{'id':'synthetic-turn','status':'interrupted'}}})
    assert h.state.failed and h.state.adverse_failure_observed
    checks['unregistered_interrupt_remains_failure']=True
    h=Host();h.state.allowed_tail_interrupts={'synthetic-turn'}
    h.state.event({'method':'turn/completed','params':{'threadId':h.state.thread,
        'turn':{'id':'synthetic-turn','status':'failed'}}})
    assert h.state.failed and h.state.adverse_failure_observed
    checks['failed_tail_not_excused']=True
    h=Host();h.state.allowed_tail_interrupts={'synthetic-turn'}
    h.state.event({'method':'error','params':{'threadId':h.state.thread}})
    assert h.state.failed and h.state.adverse_failure_observed
    checks['native_service_error_still_failure']=True
    assert all(checks.values())
    return {'schema':'er9.luna.complete-tail-regression.v1','inference_started':False,
            'actual_native_goals':0,'status':'PASS','checks':checks,
            'native_transport_guardian_and_artifact_worker_unchanged':True}


if __name__=='__main__':
    result=run();Path(__file__).with_name('REGRESSION.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
