#!/usr/bin/env python3
"""Author the explicitly selected C3-W12/2 TEST_ONLY source edition.

This is source authoring BEFORE import/birth, not runtime patching. The 778-file
predecessor and every private predecessor map stay untouched. The authored
successor's actual source, command, body, physical and append classes constitute
one separately selected original issuer composition. Native NOT_RUN.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import shutil

PREDECESSOR = Path('/home/sittingmongoose/PM-Experiments/goal-update-canonical-root-20260912/canonical-copy-v2')
PREDECESSOR_SHA = 'afa83115a8d39ad8dc6cb911ae8c9cc6985ac705eb792d8ed962dce31159e839'
ROOT = Path(__file__).resolve().parents[1]


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def replace(text, old, new, count=1):
    assert text.count(old) == count, (old, text.count(old), count)
    return text.replace(old, new)


def author(destination):
    assert not destination.exists(), 'successor destination must be absent'
    manifest_raw = (PREDECESSOR/'manifest.json').read_bytes()
    assert sha(manifest_raw) == PREDECESSOR_SHA
    predecessor = json.loads(manifest_raw)
    for row in predecessor['files']:
        raw = (PREDECESSOR/row['path']).read_bytes()
        assert len(raw) == row['bytes'] and sha(raw) == row['sha256'], row['path']
    shutil.copytree(PREDECESSOR, destination, ignore=shutil.ignore_patterns('__pycache__'))
    # Keep the predecessor manifest as an explicit historical member. It is
    # never presented as the manifest of the newly authored source edition.
    (destination/'predecessor-manifest.json').write_bytes(manifest_raw)
    (destination/'manifest.json').unlink()
    changed = []
    def write(path, text):
        (destination/path).parent.mkdir(parents=True,exist_ok=True)
        (destination/path).write_text(text)
        changed.append(path)

    p = 'goal_source.py'
    s = (destination/p).read_text()
    s = replace(s, "def __init__(self, request, identity, metadata, grant, now='2026-09-12T08:00:00Z'):",
        "def __init__(self, request, identity, metadata, grant, now='2026-09-12T08:00:00Z', *, approval_owner_v2=None):")
    s = replace(s, "         if request['change_source']!='user_direct' or request['source_message_id']is not None or request['approval_id']is not None:\n          raise U.Unavailable('agent approval provider unavailable in this finite original Direct Save profile')",
        "         if request['change_source']=='user_direct':\n          if request['source_message_id']is not None or request['approval_id']is not None or approval_owner_v2 is not None:raise U.Unavailable('direct Save original acceptance without provider')\n         else:\n          from approval_bridge_v2 import ApprovalBridgeV2\n          if type(approval_owner_v2)is not ApprovalBridgeV2:raise U.Unavailable('actual successor approval participant required')\n          approval_owner_v2.admit_source(self,request,metadata)")
    s = replace(s, "         if acceptance['change_source']!='user_direct' or acceptance['source_message_id']is not None or acceptance['approval_id']is not None:raise U.Unavailable('original direct acceptance facts')",
        "         if any(acceptance[k]!=request[k] for k in ('change_source','source_message_id','approval_id')):raise U.Unavailable('exact successor acceptance source facts')")
    s = replace(s, "         self.command=None;self.token=object();self._update_state=state;self.available=True;self.allowed=True;self.input_allowed=True",
        "         self.command=None;self.token=object();self._update_state=state;self.available=True;self.allowed=True;self.input_allowed=True;self._approval_owner_v2=approval_owner_v2")
    write(p, s)

    p = 'runtime/physical/source/model.py'
    s = (destination/p).read_text()
    s = s.replace('capture_direct_save_authority', 'capture_update_authority_v2')
    s = replace(s, "    if r['change_source']!='user_direct' or r['source_message_id']is not None or r['approval_id']is not None or r['prior_revision_hash']!=source['prior_revision_hash'] or r['objective_text']!=state['input']['request']['objective_text']:raise U.Unavailable('original accepted revision source/history joins')",
        "    if any(r[k]!=source['acceptance'][k] for k in ('change_source','source_message_id','approval_id')) or r['prior_revision_hash']!=source['prior_revision_hash'] or r['objective_text']!=state['input']['request']['objective_text']:raise U.Unavailable('successor accepted revision source/history joins')")
    s = replace(s, "    r=dict(goal_id=b['goal_id'],revision=nb['revision'],objective_text=text,change_source='user_direct',source_message_id=None,approval_id=None,prior_revision_hash=c['latest_revision_hash'],revision_hash='0'*64,created_at=nb['updated_at']);r['revision_hash']=hashrev(r)",
        "    r=dict(goal_id=b['goal_id'],revision=nb['revision'],objective_text=text,change_source=source['acceptance']['change_source'],source_message_id=source['acceptance']['source_message_id'],approval_id=source['acceptance']['approval_id'],prior_revision_hash=c['latest_revision_hash'],revision_hash='0'*64,created_at=nb['updated_at']);r['revision_hash']=hashrev(r)")
    s = replace(s, "    if r is None or r['change_source']!='user_direct' or r['approval_id']is not None or r['source_message_id']is not None:raise U.Unavailable('original accepted full Direct Save revision')",
        "    if r is None or any(r[k]!=source['acceptance'][k] for k in ('change_source','approval_id','source_message_id')):raise U.Unavailable('original accepted full successor revision')")
    s = replace(s, "   if request['change_source']!='user_direct' or acceptance['change_source']!='user_direct' or request['approval_id']is not None or request['source_message_id']is not None or acceptance['approval_id']is not None or acceptance['source_message_id']is not None:\n    raise U.Unavailable('only genuine original Direct Save path selected; approval provider unavailable')",
        "   if any(request[k]!=acceptance[k] for k in ('change_source','approval_id','source_message_id')):raise U.Unavailable('successor request/acceptance join')\n   from approval_bridge_v2 import check_acceptance_v2\n   check_acceptance_v2(sir,live=True)")
    s = replace(s, "source_message_id=None,approval_id=None,authority_ref=acceptance['original_change_authority_ref'],source_audit_sha256=U.h(U.row('SourceAudit',source)),updated_at=state['clock'])",
        "source_message_id=request['source_message_id'],approval_id=request['approval_id'],authority_ref=acceptance['original_change_authority_ref'],source_audit_sha256=U.h(U.row('SourceAudit',source)),updated_at=state['clock'])")
    write(p, s)
    # Every original owner fence now checks the actual immutable acceptance,
    # and checks live person/message custody only before the genuine receipt.
    # The body issuer's final predicate runs after before_commit, too.
    for p in ['goal_source.py', 'goal_command.py', 'shared_link.py',
              'runtime/physical/source/model.py', 'runtime/physical/adapter.py']:
        s = (destination/p).read_text()
        s = s.replace('capture_direct_save_authority', 'capture_update_authority_v2')
        marker = "state=sir._update_state;source=state['source'];operation=source['normalized_identity']['operation_id'];original_start=physical._command_owner"
        lines = []
        for line in s.splitlines():
            lines.append(line)
            if marker in line:
                indent = line[:len(line)-len(line.lstrip())]
                lines.append(indent+'from approval_bridge_v2 import check_acceptance_v2')
                lines.append(indent+"check_acceptance_v2(sir,live=operation not in semantic.receipts)")
        write(p, '\n'.join(lines)+'\n')
    shutil.copyfile(ROOT/'scripts/pm_goal_own_c3_w12_approval.py', destination/'approval_bridge_v2.py')
    changed.append('approval_bridge_v2.py')
    runner = (destination/'ordinary_runner.py').read_text()
    runner = replace(runner, "a.add_argument('--output',type=Path,required=True);v=a.parse_args()",
        "a.add_argument('--output',type=Path,required=True);a.add_argument('--agent',action='store_true');a.add_argument('--selection',type=Path,required=True);a.add_argument('--stop-before-body',choices=['revoke','expire']);a.add_argument('--expire-after-body',action='store_true');v=a.parse_args();assert v.agent or not(v.stop_before_body or v.expire_after_body)")
    runner = replace(runner, " assert manifest['status']=='PREPARED_SOURCE_ONLY_AWAITING_ROOT_EXECUTION_DECISION';assert manifest['reviewed_source_sha256']=='9a524ff7e0bbf20c40d930c13f2cfae992003c501f212da96c802cd8145a3876'",
        " selection=json.loads(v.selection.read_text());assert selection['manifest_sha256']==v.packet_sha256 and Path(selection['candidate_path']).resolve()==packet\n assert manifest['status']=='NEWLY_AUTHORED_TEST_ONLY_PREPARED_WITHOUT_ADMISSION'")
    runner = replace(runner, "assert str(out).startswith('/mnt/Cursor/PuppetMaster-Evidence/tests/')",
        "assert out.is_relative_to(Path('/mnt/Cursor/PuppetMaster-Evidence/tests').resolve())")
    agent_code = '''  from pm_goal_current_writer_oracles import recipe
  event_id,event_key=recipe('goal.updated',dict(storage_instance_id=semantic.instance,project_id=body['project_id'],thread_id=body['thread_id'],goal_id=body['goal_id'],command_id=normalized['command_id'],command_instance_id=normalized['command_instance_id'],operation_id=normalized['operation_id']))
  metadata['producer_metadata'].update(event_id=event_id,idempotency_key=event_key)
  bridge=None
  if v.agent:
   from approval_bridge_v2 import ChatOwnerV2,PersonOwnerV2,ApprovalBridgeV2
   update_request.update(change_source='agent_proposed_user_approved',source_message_id='message:actual-agent-v2',approval_id='approval:actual-person-v2',source_surface='chat_goal_approved_agent')
   normalized['payload_sha256']=U.h(update_request)
   target=dict(scope=dict(storage_instance_id=semantic.instance,**{k:body[k] for k in ('project_id','thread_id','goal_id')}),expected_revision=update_request['expected_revision'],expected_currentness_hash=update_request['expected_currentness_hash'],objective_text=newtext)
   proposal=dict(schema_id='pm.goal.update.proposal_request.v1',schema_version='1.0.0',command_id='cmd.chat.goal.propose_update',command_instance_id='proposal:actual-v2',target=target,actor_ref=update_request['actor_ref'],permission_snapshot_ref=update_request['permission_snapshot_ref'],source_message_id=update_request['source_message_id'],instruction_message_id='message:actual-user-instruction-v2',return_route_ref=update_request['return_route_ref'])
   chat=ChatOwnerV2();human=PersonOwnerV2('person:actual-v2')
   chat.agent_message(update_request['source_message_id'],body['thread_id'],update_request['actor_ref'],newtext)
   chat.user_instruction(proposal['instruction_message_id'],body['thread_id'],target)
   chat.accept_dispatch(proposal)
   bridge=ApprovalBridgeV2(chat,human,proposal,U,update_request['approval_id'],'2026-09-12T08:00:07Z','2026-09-12T09:00:00Z')
   human.protected_decision(update_request['approval_id'],U.h(proposal),'approved','2026-09-12T08:00:08Z');bridge.now=now
   resolution=bridge.resolve()
   metadata['acceptance'].update(change_source=update_request['change_source'],source_message_id=update_request['source_message_id'],approval_id=update_request['approval_id'],original_change_authority_ref=resolution['protected_person_decision_ref'])
   metadata['acceptance']['origin']['source_message_refs']=[update_request['source_message_id']]
  sir=S.GoalSource(update_request,normalized,metadata,None,now=now,approval_owner_v2=bridge);command=C.GoalCommand(physical,sir,shared,goal_id=body['goal_id'])'''
    runner = replace(runner, "  sir=S.GoalSource(update_request,normalized,metadata,None,now=now);command=C.GoalCommand(physical,sir,shared,goal_id=body['goal_id'])", agent_code)
    body_call = "  receipt=command.commit_update_body();p2=command.read_update_progress();committed=semantic.current()"
    body_probe = '''  if v.stop_before_body:
   from pm_goal_own_c_oracles import Refusal
   def change_approval(owner):
    if v.stop_before_body=='revoke':bridge.revoked=True
    else:bridge.now=bridge.approval['expires_at_utc']
   expected='A2/revoked' if v.stop_before_body=='revoke' else 'A2/expiry'
   try:semantic.commit(before_commit=change_approval)
   except Refusal as error:check('sole_body_final_approval_guard',str(error)==expected)
   else:raise AssertionError('body commit accepted changed live approval')
   check('refusal_preserves_whole_reserved_body_history_control',semantic.current()==reserved)
   check('refusal_preserves_original_receipts_and_event_source',semantic.receipts==base_receipts and shared.store._owner['source']['frames']==base_frames)
   save('result',dict(status='PASS_NEGATIVE_LIVE_APPROVAL',checks=checks,expected_guard=expected,source_packet_sha256=v.packet_sha256,native='NOT_RUN'))
   return
  receipt=command.commit_update_body();p2=command.read_update_progress();committed=semantic.current()
  if v.expire_after_body:bridge.now=bridge.approval['expires_at_utc']'''
    runner = replace(runner, body_call, body_probe)
    write('scripts/pm_goal_own_c3_w12_packet_runner.py',runner)
    (destination/'SUCCESSOR-v2.md').write_text(
        '# Newly authored C3-W12 approved-agent source/command edition v2\n\n'
        'TEST_ONLY; native NOT_RUN; prepared without admission. This is a new '
        'source composition, never a relabelled predecessor birth. Select this '
        'whole manifest before import. Predecessor schema and codec editions '
        'remain explicit. Direct Save requires no approval. The actual approval '
        'participant joins the original source, sole body issuer, original '
        'physical transaction, append and terminal owners; original class and '
        'map identities are retained within this successor composition.\n')
    rows = []
    for path in sorted(destination.rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts:
            raw = path.read_bytes()
            rows.append(dict(path=str(path.relative_to(destination)), bytes=len(raw), sha256=sha(raw)))
    result = dict(schema_id='pm.goal.update.original_composition.v2',
        status='NEWLY_AUTHORED_TEST_ONLY_PREPARED_WITHOUT_ADMISSION',
        canonical_graph_sha256=predecessor['canonical_graph_sha256'],
        predecessor=dict(path=str(PREDECESSOR), manifest_sha256=PREDECESSOR_SHA,
                         births='HISTORY_ONLY_NEVER_RECLASSIFIED'),
        source='goal_source.py', command='goal_command.py',
        sole_body_issuer='runtime/physical/source/model.py',
        approval_participant='approval_bridge_v2.py',
        changed_members=sorted(set(changed)), files=rows)
    (destination/'manifest.json').write_text(json.dumps(result,indent=2)+'\n')
    return dict(path=str(destination), manifest_sha256=sha((destination/'manifest.json').read_bytes()),
                members=len(rows), changed_members=result['changed_members'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--author', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(author(args.author),indent=2))
