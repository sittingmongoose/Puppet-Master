"""Confirm the genuine native Goal before the immutable native stop.

No timestamp in a delayed payload can extend or reset the original clock.
The caller closes any exact active turn tail, then requires original artifact
freeze and every owned-unit quiescence check. This establishes no source grade.
"""
import time


def establish_native_complete(host,native_stop_ns,clock=time.monotonic_ns):
    now=clock()
    if now>=native_stop_ns:raise TimeoutError('native completion not established before original stop')
    if host.state.goal_status!='complete':return None
    if host.attention or host.state.failed:raise RuntimeError('adverse native event before completion')
    if not host.state.activation.get('native_activation_observed'):
        raise RuntimeError('genuine native Goal activation not established')
    receipt=host.call('thread/goal/get',{'threadId':host.state.thread},
                      timeout=min(3,(native_stop_ns-now)/1e9))
    if host.state.goal(receipt)!='complete':return None
    observed=clock()
    if observed>=native_stop_ns:raise TimeoutError('native completion receipt arrived at or after original stop')
    if host.attention or host.state.failed or host.state.goal_replacements_observed:
        raise RuntimeError('adverse native event or Goal identity drift during confirmation')
    return {'native_goal_receipt':receipt,'verified_monotonic_ns':observed,
            'original_native_stop_monotonic_ns':native_stop_ns,
            'complete_verified_before_original_stop':True,
            'active_turn_ids':sorted(host.state.active_turns),
            'turn_tail_policy':'interrupt exact active tail; no new Goal/user turn/clock extension',
            'semantic_quality':'PENDING_INDEPENDENT_EVALUATION'}
