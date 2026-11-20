"""W.8/W.9 original source-context and process-trace checks for CH1.

Trace entries are independently held synthetic observations, never commands
executed by this checker. Native git, API, shell and lock execution is NOT_RUN.
"""
from pm_dch_worktree import closed

ACTIONS={'merged','merge_failed','pr_created','pr_failed','pre_merge_test_started','pre_merge_test_passed','pre_merge_test_failed'}


def context_schema(action):
    schema=closed(dict(target_branch_exists=dict(type='boolean'),main_repo_dirty=dict(type='boolean'),
        github_remote_configured=dict(type='boolean'),head_detached=dict(type='boolean'),
        test_target=dict(enum=['merged_result','branch_only']),tests_enabled=dict(type='boolean'),
        failure_stage=dict(enum=['guard','git','hook','rebase_conflict']),
        platform=dict(enum=['unix','windows']),override_authorized=dict(type='boolean'),
        pm_environment_delta=closed({})))
    if action=='pre_merge_test_started':
        schema['properties']['launch_state']=dict(enum=['not_launched','launched'])
        schema['required'].append('launch_state')
    return schema


def expected_trace(action,p,ctx):
    strategy=p.get('strategy');target=ctx['test_target'];enabled=ctx['tests_enabled']
    start=['lock','recheck_guards']
    if action.startswith('pr_'):
        return ['lock','recheck_head','check_github_remote','auto_push'+('_failed' if action=='pr_failed' and p['phase']=='push' else '' )]+(
            [] if action=='pr_failed' and p['phase']=='push' else ['api_created' if action=='pr_created' else 'api_failed'])+['unlock']
    if action=='merge_failed':
        stage=ctx['failure_stage']
        if stage=='guard':return start+['unlock']
        if stage=='rebase_conflict':return start+['fetch_attempt','worktree:git_rebase_failed','worktree:git_rebase_abort','unlock']
        if stage=='git':return start+['fetch_attempt',('worktree:git_rebase_failed' if strategy=='rebase' else 'main:checkout_target'),
            *([] if strategy=='rebase' else ['main:git_merge_failed']),'unlock']
        # A hook failure is after the normal test pipeline, at the commit point.
        success=expected_trace('merged',p,ctx)
        return [s.replace('main:commit_hooks','main:commit_hook_failed').replace('main:ff_merge_hooks','main:ff_merge_hook_failed') for s in success]
    if action in ('pre_merge_test_passed','pre_merge_test_failed'):
        root='main' if target=='merged_result' and strategy in ('squash','merge') else 'worktree'
        shell='/bin/sh -c' if ctx['platform']=='unix' else 'cmd /c'
        trace=[root+':'+shell+':'+p['command'],'outcome:'+('exit:0' if action.endswith('_passed') else p['test_outcome'])]
        if action.endswith('_failed') and target=='merged_result':
            trace.append({'squash':'main:git_reset_hard_HEAD','merge':'main:git_merge_abort','rebase':'worktree:git_rebase_abort'}[strategy])
        return trace+['unlock']
    if action=='pre_merge_test_started':
        trace=start+['safe_point_snapshot']
        if target=='merged_result':
            trace+=['fetch_attempt']+(['worktree:git_rebase'] if strategy=='rebase' else ['main:checkout_target',
                'main:git_merge_squash_uncommitted' if strategy=='squash' else 'main:git_merge_no_ff_no_commit'])
        trace+=['append_started','first_receipt']
        if ctx['launch_state']=='launched':
            root='main' if target=='merged_result' and strategy!='rebase' else 'worktree'
            shell='/bin/sh -c' if ctx['platform']=='unix' else 'cmd /c'
            trace.append(root+':'+shell+':'+p['command']+':launch')
        return trace
    trace=start+['fetch_attempt']
    if enabled and target=='branch_only':trace+=['worktree:tests']
    if strategy=='rebase':
        trace+=['worktree:git_rebase']
        if enabled and target=='merged_result':trace+=['worktree:tests']
        trace+=['main:checkout_target','main:ff_merge_hooks']
    else:
        trace+=['main:checkout_target',('main:git_merge_squash_uncommitted' if strategy=='squash' else
                 'main:git_merge_no_ff_no_commit' if enabled and target=='merged_result' else 'main:git_merge_no_ff')]
        if enabled and target=='merged_result':trace+=['main:tests']
        trace+=['main:commit_hooks']
    return trace+['unlock']


def check(m,family,p,o):
    action=family.removeprefix('chat.thread_worktree_')
    if action not in ACTIONS:return
    ctx=o['operation']['owner_context']
    refused=[]
    if action.startswith('pre_merge_test_') and ctx['tests_enabled'] is not True:refused.append('test_not_enabled')
    if action in ('merged','merge_failed','pre_merge_test_started'):
        # WM04/WS04 already own the four worktree guards. A failed-merge
        # source has no such earlier success guard and must classify them here.
        bad=[k for k,v in o['operation']['outcome']['guards'].items() if v is not False] if action=='merge_failed' else []
        if not ctx['target_branch_exists']:bad.append('target_branch_deleted')
        if ctx['tests_enabled'] and ctx['test_target']=='merged_result' and p['strategy'] in ('squash','merge') and ctx['main_repo_dirty']:
            bad.append('main_repo_dirty')
        if action=='merge_failed' and ctx['failure_stage']=='guard':
            if not bad:refused.append('guard_failure_without_a_failed_guard')
        else:refused+=bad
        if action=='merge_failed' and ctx['failure_stage']=='rebase_conflict' and not (p['strategy']=='rebase' and p['has_conflicts'] is True):
            refused.append('rebase_conflict_source')
    if action.startswith('pr_'):
        if not ctx['github_remote_configured']:refused.append('github_remote_missing')
        if ctx['head_detached']:refused.append('detached_head')
    # A terminal's original target comes from its authenticated retained start,
    # which check_original has already passed through the existing TJ/HR chain.
    original_target=ctx['test_target']
    if action=='pre_merge_test_started':original_target=p['test_target']
    if action in ('pre_merge_test_passed','pre_merge_test_failed'):
        source=o['test_source'];w=source['started_access']
        started=m._resolve_body(source['started'],w.get('payload_source'),w['storage_instance_id'],m._record_number_rule(w))
        original_target=started['test_target']
    m.require('wt_protocol',dict(context_refusals=refused,target=ctx['test_target'],original_target=original_target,
        override_requested=p.get('user_override',False) or action=='merged' and o['operation']['outcome']['tests']=='explicit_override',override_authorized=ctx['override_authorized'],
        guard_conflicts=action=='merge_failed' and ctx['failure_stage']=='guard' and o['operation']['outcome']['guards']['conflicts'] is True,
        payload_conflicts=p.get('has_conflicts'),trace=o['operation']['execution_trace'],expected_trace=expected_trace(action,p,ctx)))
