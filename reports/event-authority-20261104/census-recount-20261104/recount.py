#!/usr/bin/env python3
"""CA-COUNT deterministic full recount at the source revision in MAIN_SHA.

Run from a checkout with unchanged Plans/scripts at that revision. The two
--generator inputs are outputs of the stock currentness generator, produced in
empty external directories. All seven generator artifacts are receipted;
timestamps and git-custody metadata do not enter NEW-LIST bytes. This tool
never writes Plans, registers a family, changes a disposition, or invokes the
frozen independent validator (which writes receipts).
"""
from __future__ import annotations
import argparse
import bisect
import collections
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
MAIN_SHA='16acf7594a3fe8559af89491b895f440b314b99e'
PINNED_EXTERNAL_INPUTS={'lanes/CA-COUNT.md': 'ca7085df112d01b5574c16273b93e126e7f75dfb21d0d9704adc38f42c0e485a', 'lanes/CARDS1-APPLY.md': 'f3f553370a89a6fc0467dedde8a5ed71169cc7e4b36f2c0be32ee2475b924104', 'decision-answers/E-CARDS-1.as-presented-578a6774.md': '578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696', 'surveys/L9/REPORT.md': 'ed537ce31df64b8ec1bd8399dd324792a5d48f041e3ba178fbfbec070541a4e5', 'surveys/L9/NEW-NAMES.jsonl': 'ff5e91c7d6c6d79d2a68155d42f992c3826e392fc96cd335e993db42cfba2b02', 'state/undecided-236.tsv': 'fad5326d8565b298257aa7f5f13f7e06fc7ecb233bb78ffaf9fca9d947c33d91', 'surveys/RT/TABLE.md': 'e3b1941dc015f98ebe12e967c8394d0f5b4ffab1bf61197135914400536e4c98'}
DEFAULT_EVIDENCE=Path('/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104')
REVIEWED_HEAD='d6dd33d5ddbd0150bb9dcfbe391460bebac04e65'
REPORT_DIR='reports/event-authority-20261104/census-recount-20261104'
PINNED_EXTERNAL_INPUTS.update({
 'BRIEF-DRAFT.md':'59e0a0f5002966a4dec489d66ea43f4fbd3711da7fdd60c0f75a0e585a265fed',
 'lanes/FIX-ROUND.md':'3320d3c595b3ea73daa508f0f7f3845c372b51e5492b46b8e31659fd778d1028',
 'reviews/CA-COUNT-sol/REVIEW.md':'a22a067876a204df9b6b6bc0c8e49034d211b3ea3480bc68fbb2e624e5232159'})
# Discovery is intentionally broader than authority: references, receipt effects,
# invalid fixtures, schema labels and command receipts must all be adjudicated.
SEMANTIC_EVENT_KEY=re.compile(r'event|emit|receipt.*effect',re.I)
READINESS_QUESTION="Does this exact dotted spelling designate a separately persisted EventRecord family, an existing family's alias, or only this receipt/transport/readiness label?"
CANCEL_QUESTION='When one required subagent fails and Puppet Master asks its cancellable siblings to stop, should each stop request be kept as its own history event, `subagent.cancel_requested`, or should it remain a live cancellation signal with no new history family?'
CANCEL_OPTIONS=[
 'A — Delivery only. Keep the specified cancellation delivery. Add no persisted `subagent.cancel_requested` family. Preserve the existing group-failure and sibling-terminal contracts.',
 'B — Record each request. Require a separately persisted `subagent.cancel_requested` family. Bring this exact additional name under an explicit technical-authority grant and settle its lifetime/counting scope before admission; DL-084 and Card 4b do not supply those by analogy.']
PROVENANCE_QUESTION='Does recording source provenance (`source_event_id` and `provenance_ref`) describe the same saved fact as resolving a navigation route (`surface_id`, `route_kind`, and `target_ref`), or must those remain separate event semantics? Orchestration and Contracts/Storage must supply equivalence evidence; any choice between conflicting owners returns to Jared.'
READINESS_RESEARCH={
 'executor.intake_report.recorded':{
  'owner_doc':'Plans/Executor_Protocol.md','binding_span':'230-239',
  'citations':['Plans/Executor_Protocol.md:638-648','Plans/Executor_Protocol.md:7443-7447'],
  'result':'Executor defines canonical non-rebuildable executor_intake_report/attempt_receipt records and the separate whole-graph aggregate intake receipt. Those records are not proof of this exact EventRecord family.'},
 'goal.receipt.recorded':{
  'owner_doc':'Plans/Goal_Runtime_System.md','binding_span':'264-274',
  'citations':['Plans/Goal_Runtime_System.md:2739-2739','Plans/Goal_Runtime_System.md:2759-2764','Plans/Goal_Runtime_System.md:5366-5375'],
  'result':'Goal names goal.receipt_recorded and a canonical non-rebuildable goal_receipt record. Neither establishes equivalence with the readiness spelling. Any eventual reconciliation must preserve DL-409/Card 3 A historical-only status and create no new Goal receipt writer.'},
 'plan_compile.stage_receipt.recorded':{
  'owner_doc':'Plans/Plan_To_Node_Compilation.md','binding_span':'219-228',
  'citations':['Plans/Plan_To_Node_Compilation.md:644-645','Plans/Plan_To_Node_Compilation.md:890-901','Plans/Plan_To_Node_Compilation.md:1026-1029'],
  'result':'Plan Compile defines resumable stage state, stage-card/worklist receipts and plan_compile_receipt handoffs. Its general EventRecord-envelope requirement does not independently identify this exact spelling as a separate family.'},
 'provider.stream.event_recorded':{
  'owner_doc':'Plans/CLI_Bridged_Providers.md','binding_span':'241-251',
  'citations':['Plans/CLI_Bridged_Providers.md:896-910','Plans/CLI_Bridged_Providers.md:1251-1266'],
  'result':'The provider facade preserves normalized stream facts and structured malformed-tool-call error events. Neither contract binds this readiness spelling to a separately persisted EventRecord family.'},
 'testing.receipt.recorded':{
  'owner_doc':'Plans/Automated_Testing_System.md','binding_span':'253-262',
  'citations':['Plans/Automated_Testing_System.md:2568-2574','Plans/Automated_Testing_System.md:2880-2882','Plans/Automated_Testing_System.md:2941-2950'],
  'result':'Testing defines the TestRunReceipt record, its merged field schema and commands that preserve it. Receipt persistence does not itself declare a separate testing.receipt.recorded EventRecord family.'}}
MISSED_LABELS={
 'source_control.command_applied':('concept_lineage','Concept reconciliation placeholder without live owner promotion; non-authoritative/concept lineage, not a new persisted candidate.',['Plans/PMConcept_Control_Reconciliation.json:4-6','Plans/PMConcept_Control_Reconciliation.json:2499-2505']),
 'backup.restore_started':('negative_fixture','Deliberately invalid event_family_ids patch exposing an unadmitted event family; not a new persisted candidate.',['Plans/product_onboarding_contract_fixtures.json:12104-12111']),
 'remote_access.connector_ready':('negative_fixture','Deliberately invalid unadmitted-family patch; not a new persisted candidate.',['Plans/product_onboarding_contract_fixtures.json:12161-12168']),
 'goal.child_other':('negative_fixture','valid:false wrong-event negative fixture under event_name; not a new persisted candidate.',['Plans/goal_child_status_history_contract_fixtures.json:155-160'])}

def sha(data): return hashlib.sha256(data).hexdigest()
def blob(value): return (json.dumps(value,indent=2,ensure_ascii=False,sort_keys=True)+'\n').encode()
def jsonl(values): return b''.join((json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode() for v in values)

# One plain sentence per event; these describe candidate semantics, not admitted producers.
DESCRIPTIONS={}
def group(prefix, pairs):
 for suffix,phrase in pairs.items():DESCRIPTIONS[prefix+suffix]=phrase[0].upper()+phrase[1:]+'.'
group('assistant_plan.',{'created':'records creation of a chat Assistant Plan','version_created':'records a new immutable version of an Assistant Plan','build_started':'records the start of work against an exact Assistant Plan version','completed':'records completion of an Assistant Plan run','cancelled':'records cancellation of an Assistant Plan run','exported':'records export of an exact Assistant Plan version','wizard_handoff_created':'records the handoff of an exact Assistant Plan version to Planning Wizard','schedule_invalidated':'records invalidation of a schedule by an Assistant Plan version change'})
group('bsd.',{'policy_changed':'records a Back Seat Driver policy revision','workflow_binding_created':'records the advisor policy bound to a workflow and its stages','assignment_started':'records the start of an advisor assignment for a primary run','assignment_paused':'records an advisor assignment pause and its cause','assignment_resumed':'records resumption of a paused advisor assignment','assignment_stopped':'records the terminal stop of an advisor assignment','review_started':'records the start of an advisor review against a primary generation','finding_held':'records an advisor finding held pending reconfirmation','finding_reconfirmed':'records reconfirmation of a held advisor finding','finding_cleared':'records clearance of an advisor finding','advice_emitted':'records delivery of advisor advice at an eligible primary boundary','finding_suppressed':'records suppression of an advisor finding under the advisor policy','review_failed':'records failure of an advisor review','review_timed_out':'records an advisor review timeout','output_quarantined':'records rejected advisor output and its quarantine disposition'})
group('testing.capture.',{'started':'records the start of a capture session for an exact target','paused':'records a capture session pause','resumed':'records capture resumption','bookmarked':'records a bookmark within captured evidence','clip_saved':'records a saved clip derived from a raw capture','target_changed':'records a capture target change with its lineage','stopped':'records the stop of a capture session','segment_finalized':'records completion of a raw capture segment','segment_recovered':'records recovery of an interrupted capture segment','segment_corrupt':'records detection of a corrupt capture segment','health_degraded':'records degradation in capture health','health_recovered':'records recovery of capture health','effective_quality_changed':'records a change in effective capture quality','redaction_applied':'records redaction applied to capture evidence','interrupted':'records interruption and continuity loss in a capture session','provenance_verified':'records successful verification of capture provenance','provenance_rejected':'records rejection of capture provenance'})
group('artifacts.',{'demonstration_video.created':'records creation of a demonstration video from identified raw capture','demonstration_video.failed':'records failure to create a demonstration video','capture_provenance.inspected':'records inspection of a capture artifact and its provenance'})
group('forge.',{'connection.validated':'records validation of an exact forge connection','connection.capabilities_changed':'records a change in the capabilities of a forge connection','connection.reauthorized':'records reauthorization of a forge connection','repository.discovered':'records discovery of a provider repository','repository.eligibility_changed':'records a change in repository eligibility','repository.created':'records creation of a repository at a forge','repository.authority_changed':'records a change in the verified authority over a repository','mirror.connected':'records connection of a repository mirror','mirror.sync_started':'records the start of a mirror synchronization','mirror.sync_completed':'records completion of a mirror synchronization','mirror.status_changed':'records a repository mirror status change','mirror.degraded':'records degradation of a repository mirror','mirror.detached':'records detachment of a repository mirror','review.created':'records creation of a repository review','review.updated':'records an update to a repository review','review.marked_ready':'records marking a repository review ready','review.approved':'records approval of a repository review','review.changes_requested':'records a request for changes on a repository review','review.merged':'records merging of a repository review','review.closed':'records closure of a repository review','review.reopened':'records reopening of a repository review','review.version_created':'records a new immutable review version','review.thread.replied':'records a reply to a review thread','review.thread.resolved':'records resolution of a review thread','review.thread.reopened':'records reopening of a resolved review thread','pipeline.started':'records the start of a repository automation run','pipeline.retried':'records a retry of a repository automation run','pipeline.cancelled':'records cancellation of a repository automation run','pipeline.completed':'records completion of a repository automation run','webhook.received':'records receipt of a forge webhook delivery','webhook.rejected':'records rejection of a forge webhook delivery','webhook.delivery_failed':'records failure of webhook delivery processing','webhook.redelivery_queued':'records queuing of a webhook redelivery','webhook.delivery_recovered':'records recovery of webhook delivery processing','api.compatibility_changed':'records a change in forge API compatibility'})
group('source_control.',{'backend.detected':'records the source-control backend detected for an exact environment','backend.selected':'records selection of a source-control backend','repository.bound':'records binding of a repository to its owner context','repository.unbound':'records removal of a repository binding','status.refreshed':'records a source-control status refresh','workspace.created':'records creation of a backend-native workspace','workspace.opened':'records opening of an existing backend-native workspace','workspace.switched':'records switching to an exact backend-native workspace','workspace.removed':'records removal of a backend-native workspace','remote.fetch_started':'records the start of a repository fetch','remote.fetch_completed':'records completion of a repository fetch','remote.sync_started':'records the start of repository synchronization','remote.sync_completed':'records completion of repository synchronization','remote.publish_started':'records the start of a repository publication','remote.publish_completed':'records completion of a repository publication','writer_lease.granted':'records granting of the repository writer lease','writer_lease.lost':'records loss of the repository writer lease','checkpoint.created':'records creation of a source-control checkpoint','checkpoint.restored':'records restoration of a source-control checkpoint'})
group('server.',{'catalog_changed':'records a Server catalog revision','endpoint_changed':'records a change to a Server endpoint','discovery_observed':'records an expiring Server discovery observation','discovery_expired':'records expiry of a Server discovery observation','identity_mismatch_detected':'records detection of a Server identity mismatch','client_pairing_state_changed':'records a Client pairing transition','client_trust_changed':'records a change in a Client trust binding','client_revoked':'records revocation of a Client','connection_state_changed':'records a change in Client-to-Server connection state'})
group('remote_access.',{'route_state_changed':'records a remote route lifecycle transition','route_preference_changed':'records a change in the preferred remote route','route_migration_state_changed':'records a transition during remote route migration','route_test_completed':'records completion of a remote route test','proxy_state_changed':'records a remote proxy state transition','remote_link_state_changed':'records a remote link state transition','private_endpoint_state_changed':'records a private endpoint state transition','public_security_violation_detected':'records detection of a security violation on a public endpoint'})
group('backup.',{'state_changed':'records a backup run state transition','destination_changed':'records a change to a backup destination'})
group('restore.',{'state_changed':'records a restore run state transition'})
group('external_research.',{'topic_started':'records the frozen plan snapshot and brief used to start a research topic','job_terminal':'records the terminal state and stopping bound of a research job','finding_classified':'records classification and credit of a research finding','packet_delivered':'records delivery of a research decision packet','budget_denied':'records refusal of a research job at its budget bound'})
group('notebook.',{'entry_committed':'records commitment of an exact notebook entry revision','entry_superseded':'records supersession of a notebook entry revision','checkpoint_committed':'records a notebook checkpoint and its required entry revisions','checkpoint_failed':'records a notebook checkpoint failure and typed reason','transition_state_changed':'records a context transition state change'})
group('continuity.',{'actor_identified':'records the actor identity used for audit continuity','provenance_recorded':'records source provenance for audit continuity','redaction_applied':'records the redaction decision for a continuity record','replay_checkpointed':'records the audit-continuity replay checkpoint'})
group('discovery.',{'invoked':'records a file-discovery request and its policy context','candidates_returned':'records the permitted candidate count and freshness of a discovery result','selected':'records selection of an opaque discovery result','fallback':'records a discovery fallback and its reason','verified':'records exact verification following candidate discovery','disabled':'records refusal or degradation because discovery is disabled','unsupported':'records refusal or degradation because discovery is unsupported','backpressure':'records discovery backpressure under resource bounds'})
group('session_prompt.',{'admitted':'records admission of a session prompt to an exact thread inbox','rejected':'records rejection of a session prompt','cancelled':'records cancellation of a session prompt','expired':'records expiry of a session prompt'})
group('goal.',{'paused':'records a Goal pause under its own admission contract','resumed':'records resumption of a paused Goal'})
DESCRIPTIONS.update({'autonomy.ceiling_checked':'Records the runtime autonomy decision after parsing and before execution.', 'planning.question_budget_exhausted':'Optionally records exhaustion of the planning question allowance while the run continues to synthesis.', 'run.graph_canonical_locked':'Records commitment of the canonical execution graph or a new replan generation.', 'testing.runtime_enabled_for_adapter':'Records the adapter evidence and authority that allowed testing to become runtime enabled.', 'plan_compile.stage_receipt.recorded':'Names a Plan Compile stage receipt and its resume or audit consumers in inherited readiness metadata.', 'executor.intake_report.recorded':'Names an Executor intake report and its activation or certification consumers in inherited readiness metadata.', 'provider.stream.event_recorded':'Names a provider stream record and its stage, usage and audit consumers in inherited readiness metadata.', 'testing.receipt.recorded':'Names a testing receipt and its certification or visible testing consumers in inherited readiness metadata.', 'goal.receipt.recorded':'Names a Goal completion receipt and its artifact or Orchestrator consumers in inherited readiness metadata.'})

def extract(ROOT,GEN,BASE):
    TOK=re.compile(r'(?<![A-Za-z0-9_./-])([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)(?![A-Za-z0-9_./-])')
    CUE=re.compile(r'\b(?:event(?:s|_type|_types|record)?|history|saved|recorded|seglog|append(?:ed|s|ing)?)\b',re.I)
    rows={}; cache={}
    def lines(path):
     if path not in cache:cache[path]=(ROOT/path).read_text().splitlines()
     return cache[path]
    def add(n,p,i,src,ctx=None,j=None):
     if not TOK.fullmatch(n):return
     row=rows.setdefault(n,{'name':n,'sources':set(),'occurrences':{}})
     row['sources'].add(src)
     if ctx is None:ctx=' '.join(x.strip() for x in lines(p)[max(0,i-2):i+1])
     row['occurrences'][(p,i)]={'path':p,'start':i,'end':j or i,'context':ctx}
    for r in map(json.loads,(GEN/'EVENT_OCCURRENCES.jsonl').read_text().splitlines()):
     for o in r['occurrences']:add(r['exact_token'],o['path'],o['line'],'generator:'+r['primary_mechanical_classification'],o['context'])
    for p in sorted((ROOT/'Plans').glob('*.md')):
     rel=p.relative_to(ROOT).as_posix();ls=lines(rel)
     for i,line in enumerate(ls):
      if True:
       for n in TOK.findall(line):add(n,rel,i+1,'prose_all_dotted_tokens')
    # Structural bindings, not arbitrary words in fixtures.
    jsonpaths=sorted(set((ROOT/'Plans').glob('*.json'))|set((ROOT/'Plans/event_payloads').rglob('*.json')))
    for p in jsonpaths:
     rel=p.relative_to(ROOT).as_posix();raw=p.read_text();ls=raw.splitlines();starts=[0]
     for m in re.finditer('\n',raw):starts.append(m.end())
     positions=collections.defaultdict(list)
     for i,line in enumerate(ls,1):
      for m in TOK.finditer(line):positions[m.group()].append(i)
     data=json.loads(raw)
     def walk(v,ks=()):
      if isinstance(v,dict):
       for k,x in v.items():
        if SEMANTIC_EVENT_KEY.search(k):
         def strings(y):
          if isinstance(y,str):yield y
          elif isinstance(y,list):
           for z in y:yield from strings(z)
          elif isinstance(y,dict):
           for z in ('const','enum'):yield from strings(y.get(z,[]))
         for value in strings(x):
          for n in TOK.findall(value):
           for i in positions[n]:add(n,rel,i,'json_binding:'+k)
        # Titles bind some schemas with no event_type property (e.g coordination).
        if k=='title' and isinstance(x,str):
         for n in TOK.findall(x):
          if 'payload' in x.lower() or 'event' in x.lower():
           for i in positions[n]:add(n,rel,i,'schema_title')
        walk(x,ks+(k,))
      elif isinstance(v,list):
       for i,x in enumerate(v):walk(x,ks+(str(i),))
     walk(data)
    # Prior discovery is a cross-check input, never accepted without a current occurrence.
    for r in map(json.loads,(BASE/'surveys/L9/NEW-NAMES.jsonl').read_text().splitlines()):
     n=r['name']
     if n not in rows:
      for p in sorted((ROOT/'Plans').glob('*.md')):
       rel=p.relative_to(ROOT).as_posix()
       for i,line in enumerate(lines(rel),1):
        if n in TOK.findall(line):add(n,rel,i,'L9_relocated')
    aug={r['event_type'] for r in map(json.loads,(ROOT/'Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl').read_text().splitlines())}
    reg={r['event_type'] for r in json.loads((ROOT/'Plans/event_family_registry.json').read_text())['families']}
    old={r['name']:r for r in map(json.loads,(BASE/'surveys/L9/NEW-NAMES.jsonl').read_text().splitlines())}
    for n,r in rows.items():
     r['sources']=sorted(r['sources']);r['occurrences']=sorted(r['occurrences'].values(),key=lambda o:(o['path'],o['start']))
     r['in_august']=n in aug;r['registered']=n in reg
     if n in old:r['L9']=old[n]

    return [rows[n] for n in sorted(rows)], jsonpaths

def adjudicate(ROOT,ROWS,BASE):
    RAW={r['name']:r for r in ROWS}
    TOK=re.compile(r'(?<![A-Za-z0-9_./-])([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)(?![A-Za-z0-9_./-])')
    A={r['event_type']:r for r in map(json.loads,(ROOT/'Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl').read_text().splitlines())}
    ADJ={}
    def assign(n,c,note,cites=None,**kw): ADJ[n]={'classification':c,'note':note,**({'citations':cites} if cites else {}),**kw}
    def block(path,start,end,c,note,**kw):
     ls=(ROOT/path).read_text().splitlines()
     for i in range(start,end+1):
      for n in TOK.findall(ls[i-1]):
       if n in RAW:assign(n,c,note,[f'{path}:{start}-{end}'],**kw)
    # Owner-positive exact lists, including names deeper than any cue window.
    for path,start,end in [
     ('Plans/Assistant_Plan_Runtime.md',1003,1010),('Plans/Back_Seat_Driver.md',371,371),
     ('Plans/Test_Capture_and_Motion_Evidence.md',183,183),('Plans/Forge_Integrations.md',632,666),
     ('Plans/Source_Control_System.md',395,413),('Plans/Server_System.md',1004,1012),
     ('Plans/Remote_Access_System.md',653,660),('Plans/Backup_Restore_System.md',793,795),
     ('Plans/External_Research.md',715,719),('Plans/Working_Notebook.md',872,876),
     ('Plans/orchestrator-subagent-integration.md',31730,31730)]:
     block(path,start,end,'persisted_event_candidate','Exact current owner event list; registration/admission fences do not erase a semantic event requirement.',owner_doc=path)
    for n in ['session_prompt.admitted','session_prompt.rejected','session_prompt.cancelled','session_prompt.expired']:
     assign(n,'persisted_event_candidate','CV-314 requires exact typed inbox event identities and idempotency for session-prompt admission.',['Plans/Contracts_V0.md:20438-20450'],owner_doc='Plans/Contracts_V0.md')
    for n in ['discovery.invoked','discovery.candidates_returned','discovery.selected','discovery.fallback','discovery.verified','discovery.disabled','discovery.unsupported','discovery.backpressure']:
     assign(n,'persisted_event_candidate','CV-291 defines exact receipt-event identities; RAP-031 and SP-224 explicitly preserve durable redacted discovery receipts.',['Plans/Contracts_V0.md:18551-18559','Plans/Runtime_Artifacts_Panel.md:976-976','Plans/storage-plan.md:15641-15641'],owner_doc='Plans/Contracts_V0.md')
    assign('autonomy.ceiling_checked','persisted_event_candidate','Permissions stores this receipt payload in the canonical event stream, projected by attempt_id.',['Plans/Permissions_System.md:9069-9069'],owner_doc='Plans/Permissions_System.md')
    # Explicitly retained non-canonical candidates are distinct from required semantic-owner candidates.
    for path,start,end in [('Plans/Plugins_System.md',4596,4600),('Plans/Multi-Account_Connection_Spec.md',145,149),('Plans/Shared_Integration_Runtime.md',1195,1201)]:
     ls=(ROOT/path).read_text().splitlines()
     for i in range(start,end+1):
      for n in TOK.findall(ls[i-1]):
       if n in RAW and not n.startswith(('pm.','Plans.')):assign(n,'not_persisted_by_owner_text','Owner explicitly marks retained packet inventory canonical=false, registered=false, emits_eventrecord=false and deferred_non_emitting_event_candidate.',[f'{path}:{start}-{end}'])
    # L9 conclusions are rechecked on the pinned source, not inferred from discovery classes.
    for r in map(json.loads,(BASE/'surveys/L9/NEW-NAMES.jsonl').read_text().splitlines()):
     n=r['name']
     if n in RAW and n not in ADJ:
      cites=[]
      for ref in r['citations']:
       path,span=ref.rsplit(':',1);lo,hi=map(int,span.split('-')); ls=(ROOT/path).read_text().splitlines()
       if hi<=len(ls) and n in '\n'.join(ls[lo-1:hi]):cites.append(ref)
      if not cites:
       o=RAW[n]['occurrences'][0];cites=[f"{o['path']}:{o['start']}-{o['end']}"]
      assign(n,r['classification'],r['note'],cites)
    # Decisions supplied with the lane. Exact old tokens stay historical or conditionally retired.
    for n,dl,note in [
     ('browser.session.navigated','DL-405','Retired by Card 2a; five manual session events remain and name their Browser workspace.'),
     ('browser.session.resized','DL-405','Retired by Card 2a; current dimensions remain session state.'),
     ('chat.response_stop_requested','DL-406','The accepted sole Stop request identity; outcome must remain on an owner-named run/turn record.'),
     ('chat_run.cancel_requested','DL-406','Superseded request spelling; normalize new Stop requests to chat.response_stop_requested.'),
     ('chat_run.cancelled','DL-406','Conditional retirement: owner must name the run/turn outcome record and fields before this outcome name retires.'),
     ('chat_run.cancel_timeout','DL-406','Conditional retirement: owner must name the run/turn outcome record and fields before this outcome name retires.'),
     ('settings.updated','DL-408','Superseded by settings.layer.changed; older history remains readable.'),
     ('settings.theme.updated','DL-408','Superseded by settings.layer.changed; older history remains readable.'),
     ('settings.agent_rules.dry_method_default_guard.updated','DL-408','Retained older dedicated DRY guard reader only; future Settings mutations use settings.layer.changed.')]:
     if n in RAW:assign(n,'decided_elsewhere:'+dl,note,decision_id=dl,persisted_candidate=n=='chat.response_stop_requested')
    for n in ['memory.gist.verification_requested','memory.gist.verified','memory.gist.verification_failed','memory.gist.updated','memory.gist.pinned','memory.gist.unpinned','memory.gist.discarded']:
     if n in RAW:assign(n,'decided_elsewhere:DL-407','Conditional retirement after memory.gist_state_changed covers successful edits, pins, discards and automatic changes; requested/failed verification gets no separate history.',decision_id='DL-407')
    # Readiness labels remain investigation evidence, with no terminal disposition.
    direct_owners=sorted((ROOT/'Plans').glob('*.md'))
    owner_tokens={p.relative_to(ROOT).as_posix():set(TOK.findall(p.read_text())) for p in direct_owners}
    for n,research in READINESS_RESEARCH.items():
     matches=[p for p,tokens in owner_tokens.items() if n in tokens]
     assert not matches,('new live owner evidence requires adjudication',n,matches)
     refs=['Plans/.implementation_readiness/non_executable_closure_evidence.json:1-10',
           'Plans/.implementation_readiness/non_executable_closure_evidence.json:'+research['binding_span'],
           'Plans/00-plans-index.md:243-243','scripts/pm-event-authority-currentness.py:95-95',*research['citations']]
     assign(n,'undetermined','Readiness-only binding; no live owner requirement found for this exact spelling. Preserved unresolved, without exclusion, registration or merge.',refs,
            owner_doc=research['owner_doc'],investigation_owner=research['owner_doc']+' + Plans/storage-plan.md',decision_owner='Jared (new history or owner conflict)',
            question=READINESS_QUESTION,owner_search={'scope':'Every direct Plans/*.md owner at MAIN_SHA; exact dotted-token lookup, plus related receipt/stream contracts cited here','documents_searched':len(direct_owners),'exact_name_matches':matches,'existing_owner_answer':None,'related_contract_result':research['result']})
    for n,(kind,note,refs) in MISSED_LABELS.items():
     assert n in RAW,('semantic discovery missed reviewed label',n)
     assign(n,'not_persisted_by_owner_text',note,refs,evidence_kind=kind)
    assign('subagent.cancel_requested','undetermined','Owner specifies delivery to cancellable siblings, not a separate permanent-history requirement. Orchestration + Storage investigate; Jared decides.',
           ['Plans/orchestrator-subagent-integration.md:31693-31697','Plans/Decision_Log.md:564-568','Plans/Decision_Log.md:608-608','Plans/Decision_Log.md:1784-1784'],
           owner_doc='Plans/orchestrator-subagent-integration.md',investigation_owner='Orchestration + Storage',decision_owner='Jared',question=CANCEL_QUESTION,options=CANCEL_OPTIONS)
    for n in ['goal.paused','goal.resumed']:
     assign(n,'persisted_event_candidate','Current Goal owner requires this exact name and forbids automatic aliasing from goal.stopped.',['Plans/Goal_Runtime_System.md:270-272','Plans/Goal_Runtime_System.md:6862-6862'],owner_doc='Plans/Goal_Runtime_System.md')
    assign('run.graph_canonical_locked','persisted_event_candidate','Graph builder/replan reconciler emits this canonical graph-lock event; Executor uses it to advance replan_generation.',['Plans/Wiring_Matrix.md:335-337','Plans/Executor_Protocol.md:903-905'],owner_doc='Plans/Executor_Protocol.md')
    assign('testing.runtime_enabled_for_adapter','persisted_event_candidate','Testing owner names this exact transition event and its payload fields.',['Plans/Automated_Testing_System.md:2590-2590'],owner_doc='Plans/Automated_Testing_System.md')
    assign('planning.question_budget_exhausted','persisted_event_candidate','CV-323 retains this exact optional admitted event alongside the mandatory result/record. Optional emission is still an event candidate, not evidence of an admitted writer.',['Plans/Contracts_V0.md:21402-21408'],owner_doc='Plans/Contracts_V0.md')
    assign('file.edited','not_persisted_by_owner_text','Formatter owner calls this the File.Edited-equivalent internal trigger after successful write/edit tools, not a persisted event family.',['Plans/Formatters_System.md:344-352','Plans/OpenCode_Deep_Extraction.md:714-714'])
    assign('node.ready','retired_or_historical','Only the compatibility/source-lineage wiring section uses node.ready; canonical runtime payload uses run.node_ready. No alias registration is inferred.',['Plans/Wiring_Matrix.md:345-363','Plans/Contracts_V0.md:2444-2448'])
    for n in ['hitl.approved','hitl.rejected']:
     assign(n,'retired_or_historical','Old scheduler wake vocabulary; storage marks HITL command compatibility migration-only and canonical approval events remain approval.granted/denied. This recount does not invent an alias.',['Plans/human-in-the-loop.md:303-303','Plans/storage-plan.md:55-55'])
    # Deferred exact rows below are edited during exhaustive review.
    MANUAL={
     'acceptance_result.passed': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:2003-2003']},
     'actions.run_commit_range': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'alias_bindings.exact_target': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/touch_closure.json:1880-1880']},
     'always_scope.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19618-19618']},
     'android.appium.uiautomator2.emulator': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:717-717']},
     'android.emu.debug': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:942-942']},
     'archive_view.set': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19596-19596']},
     'attachment.add': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FileManager.md:5225-5225']},
     'attempt.start.before': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/Plugins_System.md:4210-4210']},
     'backend.detect': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:384-384']},
     'backend.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:384-384']},
     'backend_gui_result.passed': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:1729-1729']},
     'backup_advanced.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19603-19603']},
     'bash_guard.check_command': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FileSafe.md:4037-4037']},
     'blocked.dirty_worktree': {'classification': 'identifier_or_field', 'note': 'Compare-origin enum value, not an event.', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'branch.create': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:2001-2001']},
     'branch.delete': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:1940-1940']},
     'branch.switch': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10861-10861']},
     'breakpoint.edit': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'breakpoint.goto_source': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'breakpoint.remove_all': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'breakpoint.set_exception_filters': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'breakpoint.toggle': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'breakpoint.toggle_activation': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'browser.agent.devtools_policy': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:2717-2717']},
     'browser.chat_capture.component_action': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:2715-2715']},
     'browser.chat_capture.full_default': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:2714-2714']},
     'browser.chat_capture.include_component_crop': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:2716-2716']},
     'build_action.receipt.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19625-19625']},
     'build_action.target.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19624-19624']},
     'build_actions.expand': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19623-19623']},
     'changes.staged': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'changes.unstaged': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'chat.activity.pin': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/00-plans-index.md:109-109']},
     'chat.headers': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:554-554']},
     'chat.history': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:27546-27546']},
     'chat.params': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:553-553']},
     'chat.thread.banner.subagent_question_unavailable': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/assistant-chat-design.md:24250-24250']},
     'chat.work_dock.agent_review': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Wiring_Matrix.md:7778-7778']},
     'chat.work_dock.process_open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Wiring_Matrix.md:7777-7777']},
     'checkpoints.hitl': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/GUI_Rebuild_Requirements_Checklist.md:155-155']},
     'claude.ai': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/CLI_Bridged_Providers.md:1511-1511']},
     'claude.cmd': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/BinaryLocator_Spec.md:344-344']},
     'cleanup.clear_agent_output': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:370-370']},
     'cleanup.ignored': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:140-140']},
     'cleanup.prune': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10595-10595']},
     'cleanup.remove_build_artifacts': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:329-329']},
     'cleanup.scan': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10595-10595']},
     'cleanup.untracked': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:140-140']},
     'clear_transition.pending_sir_custody.original_source.nonterminal_outcome': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:23118-23118']},
     'cloudquotas.googleapis.com': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/Multi-Account.md:130-130']},
     'command.execute.before': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:556-556']},
     'commands.create': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6963-6963']},
     'commands.delete': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6924-6924']},
     'commands.export': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6969-6969']},
     'commands.import_commit': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6968-6968']},
     'commands.import_preview': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6967-6967']},
     'commands.preview': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6924-6924']},
     'commands.reset_all': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6970-6970']},
     'commands.save_': {'classification': 'retired_or_historical', 'note': 'Commands owner explicitly retired the first-draft save spellings; not event identities.', 'citations': ['Plans/Commands_System.md:6923-6924', 'Plans/Commands_System.md:7366-7366']},
     'commands.save_existing': {'classification': 'retired_or_historical', 'note': 'Commands owner explicitly retired the first-draft save spellings; not event identities.', 'citations': ['Plans/Commands_System.md:6923-6924', 'Plans/Commands_System.md:7366-7366']},
     'commands.save_new': {'classification': 'retired_or_historical', 'note': 'Commands owner explicitly retired the first-draft save spellings; not event identities.', 'citations': ['Plans/Commands_System.md:6923-6924', 'Plans/Commands_System.md:7366-7366']},
     'commands.save_override': {'classification': 'retired_or_historical', 'note': 'Commands owner explicitly retired the first-draft save spellings; not event identities.', 'citations': ['Plans/Commands_System.md:6923-6924', 'Plans/Commands_System.md:7366-7366']},
     'commands.update': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6964-6964']},
     'communicator.post_message': {'classification': 'identifier_or_field', 'note': 'Code method invocation, not an event discriminator.', 'skip_rule': 'code_member_access', 'citations': ['Plans/orchestrator-subagent-integration.md:4858-4858']},
     'compose.run_scenario': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10447-10447']},
     'compose.save_scenario': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10447-10447']},
     'computer.keys': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:9896-9896']},
     'computer.pointer': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:9896-9896']},
     'computer.screen': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:9895-9895']},
     'computer.stop': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Permissions_System.md:10536-10536']},
     'computer_use.apps.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19615-19615']},
     'computer_use.details.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19617-19617']},
     'computer_use.disclosure.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19616-19616']},
     'config_wiring_result.passed': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:1707-1707']},
     'conflict.review': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'connection.add': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:2060-2060']},
     'container.start': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:9892-9892']},
     'contribution_choice.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19602-19602']},
     'conversion_mapping.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19627-19627']},
     'copy_kind.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19582-19582']},
     'copy_setting.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19583-19583']},
     'dashboard.add_widget': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:29890-29890']},
     'debug.agent_session_trace': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Tools.md:238-238']},
     'debug.browser_automation': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Tools.md:238-238']},
     'debug.bundle_export': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Tools.md:238-238']},
     'debug.dap': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Tools.md:238-238']},
     'debug.logs_and_console': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Tools.md:238-238']},
     'debug.target_discovery': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Tools.md:238-238']},
     'desktop.appium.mac2': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:715-715']},
     'desktop.appium.windows': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:715-715']},
     'differences.compare': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19578-19578']},
     'differences.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19577-19577']},
     'discovery.enabled': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Tools.md:11514-11514']},
     'docker.project_state': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:938-938']},
     'docker.sock': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Containers_Registry_and_Unraid.md:5775-5775']},
     'docs.example.com': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/Permissions_System.md:417-417']},
     'doctor.browser.runtime': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:753-753']},
     'doctor.debug.attach_pid': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8636-8636']},
     'doctor.debug.browser_session': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8636-8636']},
     'doctor.debug.launch_config': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8636-8636']},
     'doctor.docker.buildx': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1039-1039']},
     'doctor.docker.compose': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1038-1038']},
     'doctor.docker.engine': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1037-1037']},
     'doctor.dockerhub.auth.capability': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Crosswalk.md:556-556']},
     'doctor.dockerhub.repo.access': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1041-1041']},
     'doctor.evidence.media': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1100-1100']},
     'doctor.formatters.available': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/OpenCode_Coverage_Matrix.md:203-203']},
     'doctor.gui_tool_catalog.freshness': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1106-1106']},
     'doctor.mcp.context7': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1102-1102']},
     'doctor.permissions.valid': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/OpenCode_Coverage_Matrix.md:158-158']},
     'doctor.plugin.conformance': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8839-8839']},
     'doctor.plugin.containment': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8839-8839']},
     'doctor.plugin.manifest_resolution': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8838-8838']},
     'doctor.plugin.permission_update_review': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8840-8840']},
     'doctor.plugin.promoted_routine_freshness': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8867-8867']},
     'doctor.plugin.rollback_health': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8840-8840']},
     'doctor.plugin.runtime_bounds': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8840-8840']},
     'doctor.plugin.supply_chain': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:8839-8839']},
     'doctor.registry.auth': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Crosswalk.md:556-556']},
     'doctor.websearch.cited': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:1104-1104']},
     'domain.docker_exec': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:9365-9365']},
     'domain.git_destructive_remote': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:9368-9368']},
     'domain.image_publish': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:9370-9370']},
     'domain.kubernetes_exec': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:9366-9366']},
     'domain.kubernetes_port_forward': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:9367-9367']},
     'domain.workflow_admin': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:9369-9369']},
     'drive.file': {'classification': 'identifier_or_field', 'note': 'OAuth scope string, not an event.', 'citations': ['Plans/Backup_Restore_System.md:1086-1086']},
     'ecto.drop': {'classification': 'identifier_or_field', 'note': 'Example destructive-shell command/module spelling in FileSafe filtering examples.', 'skip_rule': 'code_member_access', 'citations': ['Plans/FileSafe.md:1244-1244']},
     'editor.max_persisted_tabs': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FileManager.md:398-398']},
     'evidence.prune_on_cleanup': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:397-397']},
     'evidence.retain_last_runs': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:397-397']},
     'evidence.retention_days': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:397-397']},
     'example.com': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/FinalGUISpec.md:5156-5156']},
     'execution_window.create': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:6573-6573']},
     'experimental.chat.messages.transform': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:242-242']},
     'experimental.session.compacting': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:259-259']},
     'experimental.text.complete': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:563-563']},
     'formatter.rustfmt': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Formatters_System.md:147-147']},
     'git.create_pr': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Decision_Log.md:6587-6587']},
     'git.export': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Jujutsu_Integration.md:436-436']},
     'git.import': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Jujutsu_Integration.md:436-436']},
     'go.mod': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/LSPSupport.md:176-176']},
     'goal.budget_': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Goal_Runtime_System.md:278-278']},
     'goal.child_': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Goal_Runtime_System.md:278-278']},
     'goal.phase_': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Goal_Runtime_System.md:278-278']},
     'goal.tranche_': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Goal_Runtime_System.md:278-278']},
     'goal.verification_decided.decision': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Goal_Runtime_System.md:3628-3628']},
     'google_accounts.json.active': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Document_Packaging_Policy.md:78-78']},
     'grant_review.cancel': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19621-19621']},
     'grant_review.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19620-19620']},
     'gui.hitl': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/human-in-the-loop.md:199-199']},
     'gui_backend_result.passed': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:1718-1718']},
     'history.commit_parent': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'history.inspect': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19586-19586']},
     'hitl.phase': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/human-in-the-loop.md:1373-1373']},
     'hitl.subtask': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/human-in-the-loop.md:1373-1373']},
     'hitl.task': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/human-in-the-loop.md:1373-1373']},
     'hook_registry.execute_after_unit': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:2446-2446']},
     'hook_registry.execute_before_unit': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:2446-2446']},
     'iisu.network': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:2163-2163']},
     'incoming_request.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19614-19614']},
     'ios.appium.xcuitest.simulator': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:716-716']},
     'ios.sim.debug': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:941-941']},
     'ios.xcode.preview': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:716-716']},
     'join_differences.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19585-19585']},
     'json.active': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Document_Packaging_Policy.md:78-78']},
     'json.next_required_stage': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/OpenCode_Coverage_Matrix.md:34-34']},
     'json.tool': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:4244-4244']},
     'launcher.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19587-19587']},
     'level_filter.set': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19576-19576']},
     'level_panel.close': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19573-19573']},
     'level_panel.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19572-19572']},
     'level_target.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19574-19574']},
     'level_view.change': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19575-19575']},
     'list_scope.set': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19606-19606']},
     'lsp.definition': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/LSPSupport.md:905-905']},
     'lsp.enabled': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/LSPSupport.md:709-709']},
     'lsp.hover': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/LSPSupport.md:905-905']},
     'lsp.references': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/LSPSupport.md:905-905']},
     'lsp.rename': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/LSPSupport.md:905-905']},
     'manager_home.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19579-19579']},
     'manager_reach.edit': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19580-19580']},
     'manager_version.preview': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19581-19581']},
     'manifest.json.split_rule': {'classification': 'identifier_or_field', 'note': 'Nested packaging manifest field path.', 'citations': ['Plans/Document_Packaging_Policy.md:131-131']},
     'media.image': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Media_Generation_and_Capabilities.md:66-66']},
     'media.image.provider': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:3793-3793']},
     'media.music': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Media_Generation_and_Capabilities.md:339-339']},
     'media.tts': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Media_Generation_and_Capabilities.md:338-338']},
     'media.video': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Media_Generation_and_Capabilities.md:73-73']},
     'memory.gist': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Project_Output_Artifacts.md:985-985']},
     'methods.json.compatibility_original_input': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Contracts_V0.md:23180-23180']},
     'minimax.io': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/Multi-Account.md:198-198']},
     'minimaxi.com': {'classification': 'identifier_or_field', 'note': 'Hostname, executable/file name, or socket name.', 'skip_rule': 'file_or_hostname', 'citations': ['Plans/Multi-Account.md:198-198']},
     'models.dev': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Models_System.md:476-476']},
     'move_conflict.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19609-19609']},
     'move_destination.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19607-19607']},
     'move_files.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19608-19608']},
     'move_preview.expand': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19610-19610']},
     'move_report.expand': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19612-19612']},
     'move_report.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19611-19611']},
     'nier.editor.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Decision_Log.md:12695-12695']},
     'node.dispatch.before': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity; invocation does not declare an EventRecord. Hook audit uses its separate plugin.hook family.', 'citations': ['Plans/Plugins_System.md:4210-4210']},
     'node.graph.select': {'classification': 'command_or_action_id', 'note': 'Graph selection UI wiring element identity.', 'citations': ['Plans/Wiring_Matrix.md:74-74']},
     'onboarding.free_models.route.disable': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Wiring_Matrix.md:8030-8030']},
     'onboarding.interaction.mode': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/DRY_Rules.md:4224-4224']},
     'onboarding.nier.mode': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:12697-12697']},
     'online_choice.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19601-19601']},
     'open_gaps.json.next_required_stage': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/OpenCode_Coverage_Matrix.md:34-34']},
     'panels.ack': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35953-35953']},
     'panels.art_filter': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35955-35955']},
     'panels.debug_start': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35954-35954']},
     'panels.docker_view': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35954-35954']},
     'panels.git_commit': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35954-35954']},
     'panels.open_chat': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Runtime_Artifacts_Panel.md:2268-2268']},
     'panels.show': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35781-35781']},
     'panels.snooze': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35953-35953']},
     'panels.test_run': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:35954-35954']},
     'parallel_group.drain_timeout_ms': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:31696-31696']},
     'path.copy': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19597-19597']},
     'pause_scope.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19630-19630']},
     'permission.ask': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/OpenCode_Deep_Extraction.md:42-42']},
     'permission.skill': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/MiscPlan.md:600-600']},
     'phase.config.max_questions': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/chain-wizard-flexibility.md:891-891']},
     'pip.oops': {'classification': 'identifier_or_field', 'note': 'Example destructive-shell command/module spelling in FileSafe filtering examples.', 'skip_rule': 'code_member_access', 'citations': ['Plans/DRY_Rules.md:1282-1282']},
     'pipeline.approve': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1181-1181']},
     'pipeline.artifact.download': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1843-1843']},
     'pipeline.open_in_browser': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1845-1845']},
     'place_menu.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19605-19605']},
     'plan_compile.command_applied': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:8627-8627']},
     'planning.wizard.final_review.approve_and_build': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Wiring_Matrix.md:179-179']},
     'plugins.disabled': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Plugins_System.md:412-412']},
     'pm7.home.unsaved': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:17422-17422']},
     'pm7.processes_open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Wiring_Matrix.md:7778-7778']},
     'pm7.project.command': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:49498-49498']},
     'pm7.project.ui_action': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:49498-49498']},
     'policy.create': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:2062-2062']},
     'policy.may_execute_tool': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Architecture_Invariants.md:157-157']},
     'policy.update': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:20883-20883']},
     'process.stdin': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/CLI_Bridged_Providers.md:1565-1565']},
     'projects.list': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Permissions_System.md:10447-10447']},
     'projects.read_chat': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Tools.md:12999-12999']},
     'projects.read_file': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Tools.md:12998-12998']},
     'projects.read_plans': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Tools.md:12999-12999']},
     'projects.search': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Tools.md:12998-12998']},
     'projects.status': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Tools.md:12998-12998']},
     'recovery.safe_point_retry': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'recovery_report.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19604-19604']},
     'redaction.inspect': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10569-10569']},
     'release.asset.download': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1183-1183']},
     'remote.add': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Automated_Testing_System.md:7100-7100']},
     'remote.publish': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:2024-2024']},
     'remote.sync': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:2024-2024']},
     'remote.update': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:1999-1999']},
     'repo.import': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Permissions_System.md:892-892']},
     'repository.delete': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1842-1842']},
     'repository.inspect': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:174-174']},
     'repository.list': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:209-209']},
     'repository_origin_review.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19619-19619']},
     'reset_target.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19584-19584']},
     'review.create': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1173-1173']},
     'review.diff': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1900-1900']},
     'review.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19593-19593']},
     'run.cancelled': {'classification': 'retired_or_historical', 'note': 'Document Packaging Policy preserves this as contradictory seam evidence, not an event it owns or a current producer binding.', 'citations': ['Plans/Document_Packaging_Policy.md:90-90']},
     'run.compile_wave_contracts': {'classification': 'identifier_or_field', 'note': 'Compiler validation command/module reference, not a saved event.', 'citations': ['Plans/Plan_To_Node_Compilation.md:1573-1573']},
     'runner.execute': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FileSafe.md:1285-1285']},
     'runner.execute_with_subagent': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/orchestrator-subagent-integration.md:2105-2105']},
     'runner.list_projection': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1901-1901']},
     'runner.registration.apply': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1182-1182']},
     'runner.registration.preview': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1901-1901']},
     'saved_setup.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19600-19600']},
     'schedule_build.cancel': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Scheduling_and_Quota_Resume.md:630-630']},
     'schedule_message.state.set': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Scheduling_and_Quota_Resume.md:796-796']},
     'scope_details.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19626-19626']},
     'scripts.test': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/assistant-chat-design.md:3308-3308']},
     'search.left': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:33145-33145']},
     'secret.set': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1844-1844']},
     'section.edit': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19590-19590']},
     'section.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19589-19589']},
     'server.auth_profile_metadata': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.backup_update_configuration': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.catalog': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.connection_definitions': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.external_secret_references': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.global_settings_templates': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.installation_manifests': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.integration_catalog': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'server.trust_metadata': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Backup_Restore_System.md:755-755']},
     'session.end': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity, not a separate persisted EventRecord.', 'citations': ['Plans/Plugins_System.md:138-138']},
     'session.start': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity, not a separate persisted EventRecord.', 'citations': ['Plans/Plugins_System.md:251-251']},
     'session.watch': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity, not a separate persisted EventRecord.', 'citations': ['Plans/Automated_Testing_System.md:2937-2937']},
     'sessions.interrupt': {'classification': 'command_or_action_id', 'note': 'Session cancellation operation name in upstream/reference or command prose; no persisted family declaration.', 'citations': ['Plans/Goal_Runtime_System.md:4640-4640']},
     'set_custody.transition': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:23102-23102']},
     'set_custody.transition.pending_sir_custody.original_source.nonterminal_outcome': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:23118-23118']},
     'settings.assistant': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:38907-38907']},
     'settings.bsd': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Back_Seat_Driver.md:1918-1918']},
     'settings.category.select': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/UI_Command_Catalog.md:9846-9846']},
     'settings.doctor.open': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:5070-5070']},
     'settings.doctor.remediation.open': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:5070-5070']},
     'settings.everywhere.write': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:10264-10264']},
     'settings.guided_tour.replay': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:5070-5070']},
     'settings.guided_tour.resume': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Automated_Testing_System.md:1816-1816']},
     'settings.onboarding.open': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:5070-5070']},
     'settings.onboarding.run_again': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:5070-5070']},
     'settings.permissions': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Permissions_System.md:9351-9351']},
     'settings.provider.installation.select': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/UI_Command_Catalog.md:9850-9850']},
     'settings.schedule': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:38908-38908']},
     'settings.scope.details.open': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/UI_Command_Catalog.md:9849-9849']},
     'settings.search.focus': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:3823-3823']},
     'settings.search.result.activate': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/UI_Command_Catalog.md:9845-9845']},
     'settings.setting.focus': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/UI_Command_Catalog.md:9848-9848']},
     'settings.storage_retention.compaction_request': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/UI_Wiring_Rules.md:1428-1428']},
     'settings.storage_retention.open': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Wiring_Matrix.md:7912-7912']},
     'settings.subcategory.select': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/UI_Command_Catalog.md:9847-9847']},
     'settings.transaction': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:7237-7237']},
     'source_location.test': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Project_System.md:917-917']},
     'source_location.update': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Project_Sync_and_Backbone.md:42-42']},
     'starter.open_details': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19599-19599']},
     'starter.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19598-19598']},
     'stash.apply': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:1939-1939']},
     'stash.create': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Source_Control_System.md:2000-2000']},
     'stash.drop': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10849-10849']},
     'stash.pop': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:10848-10848']},
     'statusbar.system_status': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:8902-8902']},
     'storage.append_observer': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:21632-21632']},
     'storage.boot_demote_floating': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/00-plans-index.md:6042-6042']},
     'storage.boot_recovery.capture_': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:23795-23795']},
     'storage.compaction': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:24233-24233']},
     'storage.fallback.export_both': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Automated_Testing_System.md:2341-2341']},
     'storage.fallback.fork_new_instance': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Automated_Testing_System.md:2341-2341']},
     'storage.fallback.keep_logical_root': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Automated_Testing_System.md:2341-2341']},
     'storage.first_append_receipt': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:22167-22167']},
     'storage.retention_hold_changed.payload.policy_ref': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Automated_Testing_System.md:2702-2702']},
     'storage.value.open': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/FinalGUISpec.md:49937-49937']},
     'subtask_id.replace': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/WorktreeGitImprovement.md:155-155']},
     'system.health.telemetry': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:3782-3782']},
     'system.mcp.timeout': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Settings_System.md:3790-3790']},
     'system.prompt': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/OpenCode_Coverage_Matrix.md:102-102']},
     'system.prompt.transform': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity, not a separate persisted EventRecord.', 'citations': ['Plans/Plugins_System.md:315-315']},
     'tab.orchestrator.switch': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Wiring_Matrix.md:76-76']},
     'tailscale.component.check': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Remote_Access_System.md:809-809']},
     'terminal.appearance.field': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Wiring_Matrix.md:7125-7125']},
     'terminal.appearance.import_scheme': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Wiring_Matrix.md:7127-7127']},
     'terminal.response.error': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:26025-26025']},
     'terminal_command_block.value_1_to_2.convert': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:1492-1492']},
     'terminal_command_block.value_1_to_2.verify': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/storage-plan.md:1492-1492']},
     'tests.test_event_authority_holding_bucket': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:8663-8663']},
     'tests.test_named_plan_semantics': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Named_Plan_System.md:431-431']},
     'tests.test_pm_browser_workspace_reset': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:8601-8601']},
     'tests.test_pm_jujutsu_closure_semantics': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:7573-7573']},
     'tests.test_pm_pnc019_currentness': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:8724-8724']},
     'tests.test_pm_runtime_vocabulary_migration': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:8601-8601']},
     'tests.test_pm_source_control_effects': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:7205-7205']},
     'tests.test_pm_wiring_vocabulary': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:6606-6606']},
     'thread.await': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Wiring_Rules.md:3117-3117']},
     'thread.branch': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Shared_Integration_Runtime.md:934-934']},
     'thread.request': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/assistant-chat-design.md:28842-28842']},
     'thread.spawn': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/assistant-chat-design.md:28842-28842']},
     'thread.title_locked': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/assistant-chat-design.md:25986-25986']},
     'tool.execute': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity, not a separate persisted EventRecord.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:1956-1956']},
     'tool.execute.after': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity, not a separate persisted EventRecord.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:211-211']},
     'tool.execute.before': {'classification': 'command_or_action_id', 'note': 'Hook or session callback/operation identity, not a separate persisted EventRecord.', 'citations': ['Plans/OpenCode_Deep_Extraction.md:211-211']},
     'tool.invoked.index_used': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/00-plans-index.md:549-549']},
     'tool.invoked.payload.meta': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Contracts_V0.md:1459-1459']},
     'tool.pytest': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/assistant-chat-design.md:3310-3310']},
     'tour.interaction.mode': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/DRY_Rules.md:4224-4224']},
     'tour.layout_restore': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Contracts_V0.md:23698-23698']},
     'tour.nier.mode': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Decision_Log.md:12696-12696']},
     'usage.refresh_interval_seconds': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/usage-feature.md:5844-5844']},
     'usage.retention_days': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/usage-feature.md:5844-5844']},
     'v1.tool_permissions': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/OpenCode_Coverage_Matrix.md:156-156']},
     'variables.add_to_watch': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'variables.copy_expression': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'variables.copy_value': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4621-4621']},
     'verification.lsp_gate': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/LSPSupport.md:932-932']},
     'version.compare': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Forge_Integrations.md:1898-1898']},
     'w_007.chat_goal_pause': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Wiring_Rules.md:1666-1666']},
     'w_008.chat_goal_resume': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Wiring_Rules.md:1666-1666']},
     'w_009.chat_goal_cancel': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Wiring_Rules.md:1666-1666']},
     'w_010.chat_goal_update': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Wiring_Rules.md:1666-1666']},
     'watch.remove_all': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Commands_System.md:4632-4632']},
     'way.select': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/UI_Command_Catalog.md:19588-19588']},
     'web.browser_program.visible': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:713-713']},
     'web.expert_browser_program.visible': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:714-714']},
     'web.index.enable': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Commands_System.md:8905-8905']},
     'web.index.mode': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:32199-32199']},
     'web.pm_browser.visible': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/newtools.md:5353-5353']},
     'web.sources': {'classification': 'command_or_action_id', 'note': 'Current source uses an operation, tool, local action, control, or wiring shorthand; no separate persisted event is inferred.', 'citations': ['Plans/Runtime_Artifacts_Panel.md:2256-2256']},
     'widget.alert_thresholds': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/usage-feature.md:794-794']},
     'widget.cta_stack': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:41-41']},
     'widget.ledger_table': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/usage-feature.md:799-799']},
     'widget.terminal_output': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/Widget_System.md:55-55']},
     'widget.tier_tree': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:38-38']},
     'window.open': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/FinalGUISpec.md:681-681']},
     'wiring_result.passed': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/orchestrator-subagent-integration.md:1992-1992']},
     'worktree.branch_compare': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/GitHub_Integration.md:96-96']},
     'worktree.node_id': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/WorktreeGitImprovement.md:636-636']},
     'worktree.path': {'classification': 'identifier_or_field', 'note': 'Explicit property, config key, schema/role/permission/profile name, enum value, method, or surface selector in the cited text.', 'skip_rule': 'reviewed_field_setting_or_selector', 'citations': ['Plans/WorktreeGitImprovement.md:636-636']},
    }
    ADJ.update(MANUAL)
    CMD_PREFIX=('cmd.','ui.','local.','catalog.','btn.','home.','terminal.agent_row.','terminal.close_row.','terminal.context.','terminal.ended_row.','terminal.header.','terminal.link.','terminal.mark_menu.','terminal.more.','terminal.tab.','assistant.redesign.','internal.','terminal.quick_select.','terminal.screen.','menu.','work.','system_status.')
    ID_PREFIX=('pm.','scd.','owner.','reader.','producer.','projector.','consumer.','writer.','state.','wiring.','details.','payload.','self.','args.','result.','request.','record.','event.','source.','config.','gui_config.','general.','branching.','code.','shell.','task.','artifact.','anchor.','migration.','original.','original_append_result.','original_execution_binding.','original_scheduler_stop.','original_d01_update.','pending.','rule.','route_target.','source_cursor.','source_locator.','provider_instance_profile.','provider_adapter_profile.','thread_detail_projection.','user.','function_call.','coverage.','page.','affected_scope.','allowed_scope.','cancellation_scope.','cause.','diagnostic.','opts.','defs.','app.','assistant.','advanced.','advanced_config.','agent.','ai.','api_compatibility.','app_installation.','attempt_record.','basis.','binding.','body.','budgets.','cache_policy.','canonical_ssot_hashes.','category.','change.','check_result.','checkpoint.','cleanup_summary.','cli_profile.','cloud_auth.','compile_queue.','concurrency.','consent.','context.','context_a.','context_b.','control.','control_census.','core_contracts.','creation_event.','crew.','criterion.','current_controls.','current_stop_control.','currentness.','cursor.','data_loss_risk.','dep_context.','derived.','device.','docker_publish_result.','engine.','error.','evidence_required.','execution_ordering.','execution_unit_context.','f.','failure_signature.','file_guard.','filesafe.','filter.','finding.','five_hour.','gap.','gap_result.','github.','guards.','identity_capture_bytes.','inspection.','interview.','investigation.','invocation.','invoke_skill.','issuer.','iteration_result.','kill.','launch_identity_reservation.','layering.','legacy_goal_receipt.','local_context.','locked_decisions.','lsp_gate.','metadata.','migration_receipt.','model.','model_roles.','msg.','n.','native.','native_cancel_result.','native_toolchain_identity.','next_task.','node_compile_hint.','node_readiness.','normalization.','orchestrator.','original_certification.','original_stop_receipt.','os_credential_store.','output.','parent.','parsed.','parsed_output.','partition.','paths.','pending_sir_custody.','plan_result.','portable_secret.','preflight_result.','processed.','project.','project_attention_item.','projection.','properties.','provider.','provider_accounts.','provider_matrix_profile.','publication_locator.','quality_gate_result.','quality_result.','readback.','reader_checkpoint.','receipt.','remediation.resolved.','resolution_after.','retention_hold_record.','review_output.','reviewer_output.','reviewer_result.','rows.','rp.','runtime.','runtime_enablement_status.','safe_point.recovery_unavailable.','scheduler.pass.','sequence_result.','settings_inventory.','seven_day.','size.','snapshot.','source_control_command_disabled_reason.','spec_lock_requirements.','ssh.','storage_profile.','summary.','surface_status_faces.','t.','terminal_event.','tier_config.','tier_context.','tier_node.','tier_overrides.','token_lease.','tool_use.','tool_store.','toolchains_images.','tools.','transition.','tsnet.','unraid_template_result.','update.','validation.','validation_pass_report.','verification_result.','wallpaper.','workflow_models_request_live_origin.','workflow_provisioning_live_input_origin.')
    FILES=re.compile(r'\.(?:v\d+(?:\.[a-z0-9_]+)*|json|jsonl|md|ts|tsx|js|mjs|txt|rs|lock|toml|html|svg|png|xml|css|db|redb|msgpack|bin|tmp|yaml|yml|har|json5|schema|zip|gitignore|py|slint|sqlite|csv|tsv|wasm|exe|sh|ps1|log|jsonc|usearch|gradle|kts|cfg|mp4|webm)$')
    # Runtime schema/property and code-member mechanics can be checked against the cited occurrences.
    def classify(r):
     n=r['name'];os=r['occurrences']
     if n in ADJ:return dict(ADJ[n])
     if r['registered']:return {'classification':'persisted_event_candidate','note':'Exact live registry family; observed membership is not a contract-depth pass or writer admission.'}
     if r['in_august']:
      cat=A[n]['category']
      if cat in ['registered_keep','persisted_unregistered_quarantine','quarantined_not_admitted']:return {'classification':'persisted_event_candidate','note':'Already in the August ledger ('+cat+'); current occurrence observed without changing its disposition.'}
      if cat=='alias':return {'classification':'retired_or_historical','note':'Existing August alias row; original disposition retained; no new family inferred.'}
      return {'classification':'retired_or_historical','note':'Existing August '+cat+' row; original disposition retained; lexical recurrence grants no new admission.'}
     if n.startswith(CMD_PREFIX):return {'classification':'command_or_action_id','note':'Command, local action, UI control, or command wiring identity; its event effect, if any, has a separate exact name.'}
     if FILES.search(n):return {'classification':'identifier_or_field','note':'File name or explicitly versioned schema/contract/key/role identifier.','skip_rule':'file_or_versioned_identifier'}
     if n.startswith(ID_PREFIX):return {'classification':'identifier_or_field','note':'Object/member, setting, schema, binding role or wiring selector in an explicit non-event namespace.','skip_rule':'field_setting_schema_or_role_namespace'}
     if re.search(r'\.(?:clone|iter|into_iter|as_str|as_array|to_string|join|is_empty|get|get_mut|insert|remove|push|retain|starts_with|ends_with|contains|len|trim|push_str|filter|map|collect|display|exists)$',n):return {'classification':'identifier_or_field','note':'Code member/method access; not an exact event discriminator.','skip_rule':'code_member_access'}
     # Unambiguous code member access anywhere in an actual code expression.
     if all(re.search(re.escape(n)+r'\s*(?:\(|==|!=|=|\.iter\(|\.clone\(|\.as_)',o['context']) for o in os):return {'classification':'identifier_or_field','note':'Code/property access in an expression, not an event discriminator.','skip_rule':'code_member_access'}
     return None
    DONE=[];LEFT=[]
    for r in ROWS:
     a=classify(r)
     if a:DONE.append({'name':r['name'],**a})
     else:LEFT.append(r)
    return DONE, LEFT


CARD35 = {
'assistant_plan.schedule_invalidated',
*('docker.compose.scenario.'+x for x in ('saved','edited','run','deleted')),
*('execution_window.'+x for x in ('created','updated','invalidated')),
'goal.continuation_evaluated',
*('named_plan.'+x for x in ('created','renamed','archived','restored','priority_changed','child_refs_changed')),
*('runtime.'+x for x in ('automation_pause_changed','quota_wait_started','quota_resume_consent_changed','quota_resume_attempted')),
*('scheduled_dispatch.'+x for x in ('created','updated','cancelled','dispatched','held','failed')),
*('todo.'+x for x in ('created','updated','work_bound','status_changed','dependency_changed','reordered','removed_from_current_list')),
'settings.layer.changed','approval.chat_tool_requested','approval.chat_tool_resolved'}

RULES={
 'Keep':'No age or count expiry; project-data deletion only; no count limit; refuse new records under storage pressure.',
 '7 years':'2555 days; 2000000 per project, refusing new records at the cap; G05 uses its specifically approved app-wide bucket.',
 'Run year':'One year after the real run finishes; 1000000 per run and 5000000 per project, then a linked successor.',
 'Chat':'As long as the chat exists; 250000 per chat then linked continuation; hide at deletion, purge within 24 hours and backups within 30 days; holds delay purge without restoring visibility.',
 '90 days':'90 days; 2000000 per project; remove only expired unheld rows; refuse new records if the cap is reached before expiry.',
 'Goal chat':'Kept with the Goal chat under its existing text rule, with no count cap.'}
GROUP_RULE={'G01':'Keep','G03':'Keep','G05':'7 years','G12':'90 days','G13':'Run year','G14':'7 years','G15':'Chat','G16':'Keep','G17':'Keep','G18':'Keep','G19':'Keep','G21':'Keep','G23':'Run year','G26':'90 days','G27':'Chat','G29':'Goal chat'}

def closest_group(n):
    if n.startswith('assistant_plan.'):return 'G15'
    if n in ('bsd.policy_changed','bsd.workflow_binding_created'):return 'G18'
    if n.startswith('bsd.'):return 'G13'
    if n.startswith('testing.capture.'):return 'G13'
    if n.startswith('artifacts.'):return 'G21'
    if n.startswith('forge.webhook.'):return 'G05' if n.endswith('rejected') else 'G26'
    if n.startswith('forge.pipeline.'):return 'G21'
    if n.startswith('forge.connection.'):return 'G05'
    if n.startswith('forge.'):return 'G01'
    if n in ('source_control.backend.detected','source_control.backend.selected','source_control.status.refreshed'):return 'G26'
    if n.startswith('source_control.'):return 'G01'
    if n.startswith(('server.client_','server.identity_')):return 'G05'
    if n.startswith('server.discovery_') or n=='server.connection_state_changed':return 'G26'
    if n.startswith('server.'):return 'G01'
    if n=='remote_access.public_security_violation_detected':return 'G05'
    if n=='remote_access.route_preference_changed':return 'G01'
    if n.startswith('remote_access.'):return 'G26'
    if n=='backup.destination_changed':return 'G01'
    if n.startswith(('backup.','restore.','continuity.')):return 'G05'
    if n.startswith('external_research.'):return 'G16'
    if n.startswith('notebook.transition_'):return 'G27'
    if n.startswith('notebook.'):return 'G03'
    if n.startswith('discovery.'):return 'G26'
    if n.startswith('session_prompt.'):return 'G15'
    if n.startswith('goal.'):return 'G29'
    if n=='planning.question_budget_exhausted':return 'G17'
    if n=='testing.runtime_enabled_for_adapter':return 'G14'
    return 'G23'

def owner_for(n,a,browser):
    if n in browser:
        ref=browser[n]['semantic_owner_ref'];return ref.split('#')[0],ref
    if a.get('owner_doc'):return a['owner_doc'],None
    prefixes={
      'collaboration.':('Plans/Collaborative_Workflows.md','13. Events; DL-091 for collaboration.failed'),
      'brainstorm.':('Plans/Collaborative_Workflows.md','13. Events'),
      'review.':('Plans/Collaborative_Workflows.md','13. Events'),
      'assistant_plan.':('Plans/Assistant_Plan_Runtime.md','Events'),
      'docker.compose.scenario.':('Plans/Containers_Registry_and_Unraid.md','CRAU-096'),
      'execution_window.':('Plans/Scheduling_and_Quota_Resume.md','Events'),
      'scheduled_dispatch.':('Plans/Scheduling_and_Quota_Resume.md','Events'),
      'runtime.quota_':('Plans/Scheduling_and_Quota_Resume.md','Events'),
      'runtime.automation_':('Plans/Commands_System.md','Absolute automation-pause control'),
      'named_plan.':('Plans/Named_Plan_System.md','5. Persistence, events, and migration'),
      'todo.':('Plans/ToDo_Runtime.md','Events'),
      'goal.':('Plans/Goal_Runtime_System.md','Goal V2 events'),
    }
    for prefix,owner in prefixes.items():
        if n.startswith(prefix):return owner
    special={
      'plan_compile.stage_receipt.recorded':('Plans/Plan_To_Node_Compilation.md','PNC-007; inherited event_payload_contract_registry at non_executable_closure_evidence.json:219-228, adoption pending'),
      'executor.intake_report.recorded':('Plans/Executor_Protocol.md','Executor intake; inherited event_payload_contract_registry at non_executable_closure_evidence.json:230-239, adoption pending'),
      'provider.stream.event_recorded':('Plans/CLI_Bridged_Providers.md','Provider facade normalized stream; inherited event_payload_contract_registry at non_executable_closure_evidence.json:241-251, adoption pending'),
      'testing.receipt.recorded':('Plans/Automated_Testing_System.md','TestRunReceipt; inherited event_payload_contract_registry at non_executable_closure_evidence.json:253-262, adoption pending')}
    if n in special:return special[n]
    raise AssertionError(('missing owner',n))

def section_at(root,path,cites):
    ls=(root/path).read_text().splitlines()
    numbers=[]
    for ref in cites:
        if ref.startswith(path+':'):numbers.append(int(ref.rsplit(':',1)[1].split('-')[0]))
    if not numbers:return 'Owner adoption required; see the exact machine binding citation'
    ln=min(numbers)
    # Markdown fenced YAML headings are still document headings; choose the preceding visible heading.
    headings=[line.lstrip('#').strip() for line in ls[:ln] if re.match(r'^#{1,6} ',line)]
    return headings[-1] if headings else 'Owner event contract'

def recommendation(n):
    targets={
      'continuity.actor_identified':'runtime_continuity.actor_bound',
      'continuity.redaction_applied':'runtime_continuity.redaction_applied',
      'continuity.replay_checkpointed':'runtime_continuity.replay_checkpointed'}
    assert n not in READINESS_RESEARCH,('unresolved label cannot receive a disposition recommendation',n)
    if n=='continuity.provenance_recorded':
        return {'action':'stopped for Jared: semantic question','question':PROVENANCE_QUESTION,
                'reason':'Source provenance is required by Orchestration (source_event_id/provenance_ref); Contracts describes navigation route resolution (surface_id/route_kind/target_ref). No cited equivalence subsumes provenance into route resolution.',
                'citations':['Plans/orchestrator-subagent-integration.md:31726-31733','Plans/Contracts_V0.md:20541-20549','Plans/Contracts_V0.md:17769-17815']}
    if n in targets:
        return {'action':'conditional merge proposal','target':targets[n],
                'target_status':'August quarantined_not_admitted; absent from live registry',
                'condition':'Jared resolves the owner semantics and owners document equivalence; target still needs its complete contract and admission.',
                'reason':'Plausible actor/redaction/replay pairing only. The target is an unadmitted August row, not a registered family or a proved alias; this source spelling remains counted in bucket (e).',
                'citations':['Plans/orchestrator-subagent-integration.md:31726-31733','Plans/Contracts_V0.md:20541-20549']}
    if n=='planning.question_budget_exhausted':
        return {'action':'exclude','status':'recommendation only; Jared has not excluded the name; remains counted',
                'reason':'CV-323 makes this event optional and already requires the owner result/record. Prefer that mandatory durable result over a second event; Jared must accept the exclusion.'}
    return {'action':'register','reason':'The current owner explicitly requires or retains this exact semantic event, and no cited owner declares it an alias of an existing family; complete its contract before admission.'}

def reviewed_bytes(root,name):
    return subprocess.check_output(['git','show',f'{REVIEWED_HEAD}:{REPORT_DIR}/{name}'],cwd=root)

def build(root,generator,evidence):
    raw,jsonpaths=extract(root,generator,evidence)
    decisions,left=adjudicate(root,raw,evidence)
    assert not left, [r['name'] for r in left]
    byname={r['name']:r for r in raw}
    august={r['event_type'] for r in map(json.loads,(root/'Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl').read_text().splitlines())}
    august_rows={r['event_type']:r for r in map(json.loads,(root/'Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl').read_text().splitlines())}
    registered={r['event_type'] for r in json.loads((root/'Plans/event_family_registry.json').read_text())['families']}
    brows={r['event_type']:r for r in json.loads((root/'Plans/browser_event_admission.json').read_text())['rows']}
    browser51=set(brows)-registered
    collab={r['name'] for r in raw if r['name'].startswith(('collaboration.','brainstorm.','review.')) and any(o['path']=='Plans/Collaborative_Workflows.md' and 434<=o['start']<=450 for o in r['occurrences'])}|{'collaboration.failed'}
    # Section 13's review.artifact_finalized is on line 451.
    collab.add('review.artifact_finalized')
    assert len(browser51)==51 and len(collab)==18 and len(CARD35)==35
    card_path=evidence/'decision-answers/E-CARDS-1.as-presented-578a6774.md'
    card_lines=card_path.read_text().splitlines()
    group_lines={m.group(1):i for i,line in enumerate(card_lines,1) if (m:=re.match(r'\| \*\*(G\d+)\*\*',line))}
    def bucket(n):
        if n in august:return 'a'
        if n in browser51:return 'b'
        if n in collab:return 'c'
        if n in CARD35:return 'd'
        return 'e'
    classified=[];skipped=[];new=[];allb=collections.Counter();linecounts={}
    for a in sorted(decisions,key=lambda a:a['name']):
        n=a['name'];r=byname[n]
        cites=a.get('citations',[])
        # Default exact occurrences are current at MAIN_SHA, not old line-number assumptions.
        if not cites:
            chosen=r['occurrences'][:1]
            cites=[f"{o['path']}:{o['start']}-{o['end']}" for o in chosen]
        for ref in cites:
            path,span=ref.rsplit(':',1);lo,hi=map(int,span.split('-'))
            if path not in linecounts:linecounts[path]=len((root/path).read_text().splitlines())
            assert 1<=lo<=hi<=linecounts[path],ref
        candidate=a['classification']=='persisted_event_candidate' or a.get('persisted_candidate',False)
        row={**a,'citations':cites,'in_august_ledger':n in august,'in_live_registry':n in registered,'discovery_sources':r['sources'],'occurrence_count':len(r['occurrences']),'persisted_candidate':candidate}
        if n in august:
            row['august_disposition_unchanged']=True
        if candidate and n not in registered:
            b=bucket(n);row['bucket']=b;allb[b]+=1
            if n not in august:
                own,section=owner_for(n,a,brows)
                nr={'name':n,'classification':a['classification'],'bucket':b,'owner_document':own,'owner_section':section or section_at(root,own,cites),'citations':cites,'in_august_ledger':False,'in_live_registry':False}
                if b=='b':nr['technical_authority']='DL-046'
                elif b=='c':nr['technical_authority']='DL-091' if n=='collaboration.failed' else 'DL-090'
                elif b=='d':nr['technical_authority']='DL-411, exactly the Card 4b list'
                else:
                    nr['technical_authority']='Returns to Jared under DL-411; no extension of technical authority or retention inferred'
                    assert n in DESCRIPTIONS,('missing description',n)
                    nr['records']=DESCRIPTIONS[n]
                    group=closest_group(n);rule=GROUP_RULE[group]
                    nr['closest_card1_retention_group']=group
                    nr['closest_card1_retention_rule']=RULES[rule]
                    nr['retention_status']='Analogy/proposal only; exact counting scope and any real-run anchor still require owner/Jared adjudication'
                    nr['retention_citation']=f'{card_path}:{group_lines[group]}-{group_lines[group]}'
                    nr['recommendation']=recommendation(n)
                    rec=nr['recommendation']
                    if 'target' in rec:
                        assert august_rows[rec['target']]['category']=='quarantined_not_admitted'
                        assert rec['target'] not in registered
                new.append(nr)
        if row.get('skip_rule'):skipped.append({k:row[k] for k in ('name','classification','skip_rule','note','citations','discovery_sources')})
        classified.append(row)
    assert len({r['name'] for r in classified})==len(raw)
    # Every mandated queue row outside both old sets is accounted for, without sampling.
    genrows=[json.loads(x) for x in (generator/'EVENT_OCCURRENCES.jsonl').read_text().splitlines()]
    classes={'likely_persisted_event_candidate','contested_positive_and_negative_event_evidence','ambiguous_event_like_token'}
    required=[r for r in genrows if r['primary_mechanical_classification'] in classes and r['exact_token'] not in august|registered]
    assert all(r['exact_token'] in {x['name'] for x in classified} for r in required)
    # Absence uses all canonical direct prose and the scanned exact machine bindings, not ledger/audit mentions.
    open236=[line.split('\t')[0] for line in (evidence/'state/undecided-236.tsv').read_text().splitlines()[1:] if line]
    assert len(open236)==236
    absent=[n for n in open236 if n not in byname]
    meta={'classified_count':len(classified),'outside_august_and_registry':sum(not r['in_august_ledger'] and not r['in_live_registry'] for r in classified),'classification_counts':dict(sorted(collections.Counter(r['classification'] for r in classified).items())), 'outside_classification_counts':dict(sorted(collections.Counter(r['classification'] for r in classified if not r['in_august_ledger'] and not r['in_live_registry']).items())), 'new_list_bucket_counts':{b:sum(r['bucket']==b for r in new) for b in 'abcde'}, 'all_unregistered_persisted_candidate_buckets':{b:allb[b] for b in 'abcde'},'live_registered_observed':len(registered), 'mechanical_required_queues':dict(sorted(collections.Counter(r['primary_mechanical_classification'] for r in required).items())), 'skip_rule_counts':dict(sorted(collections.Counter(r['skip_rule'] for r in skipped).items())), 'absent_open_august_rows':absent,'machine_files_scanned':len(jsonpaths),'direct_prose_files_scanned':len(list((root/'Plans').glob('*.md')))}
    previous={r['name']:r for r in map(json.loads,reviewed_bytes(root,'CLASSIFIED.jsonl').splitlines())}
    previous_new={r['name']:r for r in json.loads(reviewed_bytes(root,'NEW-LIST.json'))}
    current_new={r['name']:r for r in new}
    old_e={n for n,r in previous_new.items() if r['bucket']=='e'}
    new_e={n for n,r in current_new.items() if r['bucket']=='e'}
    meta['semantic_keys_with_dotted_bindings']=sorted({s.removeprefix('json_binding:') for r in raw for s in r['sources'] if s.startswith('json_binding:')})
    meta['unresolved_names']=[r['name'] for r in classified if r['classification']=='undetermined']
    meta['round1_changes']={
      'reviewed_head':REVIEWED_HEAD,
      'newly_examined':[{k:r[k] for k in ('name','classification','note','citations')} for r in classified if r['name'] not in previous],
      'names_no_longer_examined':sorted(set(previous)-set(byname)),
      'classification_changes':[{'name':r['name'],'before':previous[r['name']]['classification'],'after':r['classification']} for r in classified if r['name'] in previous and r['classification']!=previous[r['name']]['classification']],
      'bucket_e_removed_to_unresolved':sorted(old_e-new_e),'bucket_e_added':sorted(new_e-old_e),
      'bucket_e_recommendation_changes':[{'name':n,'before':previous_new[n]['recommendation'],'after':current_new[n]['recommendation']} for n in sorted(old_e&new_e) if previous_new[n]['recommendation']!=current_new[n]['recommendation']]}
    assert meta['round1_changes']['bucket_e_removed_to_unresolved']==sorted(READINESS_RESEARCH)
    assert not meta['round1_changes']['names_no_longer_examined']
    assert all(not r['persisted_candidate'] and 'bucket' not in r for r in classified if r['classification']=='undetermined')
    return blob(new),jsonl(classified),jsonl(skipped),meta,new,classified,jsonpaths


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3])
    parser.add_argument('--generator',type=Path,required=True)
    parser.add_argument('--replay-generator',type=Path,required=True)
    parser.add_argument('--evidence-root',type=Path,default=DEFAULT_EVIDENCE)
    parser.add_argument('--outdir',type=Path,required=True)
    args=parser.parse_args();root=args.root.resolve();out=args.outdir.resolve();ev=args.evidence_root.resolve()
    for relative,digest in PINNED_EXTERNAL_INPUTS.items():
        assert sha((ev/relative).read_bytes())==digest,('external input drift',relative)
    subprocess.run(['git','diff','--exit-code',MAIN_SHA,'--','Plans','scripts'],cwd=root,check=True,capture_output=True)
    first=build(root,args.generator,ev)
    second=build(root,args.replay_generator,ev)
    assert first[:4]==second[:4], 'same-source replay changed list, classifications, skips or counts'
    new_bytes,class_bytes,skip_bytes,meta,new,classified,jsonpaths=first
    assert (args.generator/'EVENT_OCCURRENCES.jsonl').read_bytes()==(args.replay_generator/'EVENT_OCCURRENCES.jsonl').read_bytes()
    input_paths=set(jsonpaths)|set((root/'Plans').glob('*.md'))
    inv=json.loads((args.generator/'CURRENT_EVENT_SOURCE_INVENTORY.json').read_text())
    input_paths|={root/r['path'] for r in inv['sources']}
    input_paths|={p for p in (root/'Plans/.audits/event-authority-2026-08-13-currentness').rglob('*') if p.is_file()}
    frozen='Plans/.audits/event-authority-2026-08-12/'
    input_paths|={root/(frozen+p) for p in ['census-adjudication/LEDGER.jsonl','closed-world-census/CURRENT_SOURCE_INVENTORY.json','closed-world-census/FREEZE_CURRENTNESS.md','closed-world-census/FRESH_CENSUS_DELTA.md','closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json','independent-validator/pm_event_authority_independent_validator.py','closed-world-census/CURRENT_SOURCE_INVENTORY.FRESH_20260812T0900.json']}
    input_paths|={root/'scripts'/p for p in ['pm-event-authority-currentness.py','pm_event_evidence_adapter.py','pm_evidence_paths.py']}
    input_paths|={ev/p for p in PINNED_EXTERNAL_INPUTS}
    inputs={str(p.relative_to(root)) if p.is_relative_to(root) else str(p):{'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted(input_paths,key=str)}
    for name in ('NEW-LIST.json','CLASSIFIED.jsonl','REPORT.md','RECEIPT.json','SKIPPED.jsonl','recount.py'):
        previous=reviewed_bytes(root,name)
        inputs[f'git:{REVIEWED_HEAD}:{REPORT_DIR}/{name}']={'sha256':sha(previous),'bytes':len(previous)}
    def gen_receipt(p):
        return {'command':['python3','scripts/pm-event-authority-currentness.py','generate','--outdir',str(p)],'output_digests':{q.relative_to(p).as_posix():sha(q.read_bytes()) for q in sorted(p.rglob('*')) if q.is_file()},'source_sha':json.loads((p/'CURRENT_EVENT_SOURCE_INVENTORY.json').read_text())['git_custody']['head']}
    gens=[gen_receipt(args.generator),gen_receipt(args.replay_generator)]
    assert all(g['source_sha']==MAIN_SHA for g in gens)
    receipt={'schema_id':'pm.event_authority.census_recount_receipt.v1','main_sha':MAIN_SHA,'generated_at_utc':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),'authority':'E-CARDS-1 4a A / DL-410; no admission, registry change, seal-check modification, fingerprint re-stamp or seal','inputs':inputs,'generators':gens,'new_list_sha256':sha(new_bytes),'new_list_bytes':len(new_bytes),'outputs':{'NEW-LIST.json':sha(new_bytes),'CLASSIFIED.jsonl':sha(class_bytes),'SKIPPED.jsonl':sha(skip_bytes),'recount.py':sha(Path(__file__).read_bytes())},'counts':meta,'reproducibility':{'independent_full_procedure_runs':2,'new_list_sha256_by_run':[sha(first[0]),sha(second[0])],'new_list_bytes_identical':first[0]==second[0],'classified_bytes_identical':first[1]==second[1],'skipped_bytes_identical':first[2]==second[2],'generator_occurrences_bytes_identical':True},'closure_claim':False}
    out.mkdir(parents=True,exist_ok=True)
    (out/'NEW-LIST.json').write_bytes(new_bytes);(out/'CLASSIFIED.jsonl').write_bytes(class_bytes);(out/'SKIPPED.jsonl').write_bytes(skip_bytes)
    (out/'RECEIPT.json').write_bytes(blob(receipt))
    (out/'REPORT.md').write_text(report(root,ev,meta,new,classified,receipt,args),encoding='utf-8')
    print(json.dumps({'main_sha':MAIN_SHA,'new_list_sha256':sha(new_bytes),'counts':meta,'replay_bytes_identical':True},indent=2))


def report(root,ev,meta,new,classified,receipt,args):
    source_lines=Path(__file__).read_text().splitlines()
    def implementation_ref(prefix):
        line=next(i for i,text in enumerate(source_lines,1) if text.startswith(prefix))
        return f'{REPORT_DIR}/recount.py:{line}-{line}'
    lines=['# CA-COUNT — full event-name recount, 2026-11-04','',f'**Source revision:** `{MAIN_SHA}`. **Branch:** `plans/ea-census-recount-20261104`.', '',
      'This is a separately frozen discovery/adjudication list under Card 4a A (DL-410), not an admitted denominator or a seal. Every name has a classification; every surviving new persisted candidate is assigned to its exact cohort. DL-411 grants technical work only for its 35 names. The additional bucket (e) list below returns to Jared; none of its recommendations grants technical drafting, retention, admission or a writer. The August census, its 236 dispositions, registry, admission files, closure-registry hashes and frozen validator are unchanged.', '',
      '## Coverage and method','',
      f"Both stock generator runs passed all currentness checks with `event_authority_closed=false`. The recount separately scanned **all {meta['direct_prose_files_scanned']} direct Plans Markdown files**, taking every dotted token even outside cue windows and backticks, and structurally parsed **{meta['machine_files_scanned']} JSON files**: every direct `Plans/*.json` (including all schema documents) and every JSON under `Plans/event_payloads/`. Semantic keys are discovered by the case-insensitive pattern `event|emit|receipt.*effect`, covering `event_name`, `event_family_ids`, `receipt_or_event_effect`, `receipt_or_event_refs`, positive/negative/compatibility event lists, event tests and `x-event-type`, as well as all original keys. String, array and const/enum bindings are scanned for every dotted token, including tokens within effect descriptions; event/payload schema titles are also scanned. This covers production Wiring Matrix emit/receipt lists. Every generator occurrence was also included, regardless of its mechanical class. L9's 158 rows were re-located and rechecked, not substituted for the new scan.", '',
      'Keys with dotted bindings in this snapshot: '+', '.join('`'+k+'`' for k in meta['semantic_keys_with_dotted_bindings'])+'.', '',
      'The prose scan has no sampling, cue-window cutoff or skipped ambiguous tail. Generated shards/indexes, migration runs, ledgers, audits and validation outputs do not originate product authority. Generator-inherited machine inputs remain discoverable; the five readiness event_type bindings are retained as **undetermined unresolved evidence**, outside NEW-LIST and all candidate buckets. They are not excluded, registered or merged. Canonical required-owner candidates remain candidates even while an admission fence prevents emission. By contrast, PKT-04 inventories explicitly marked canonical=false and deferred_non_emitting_event_candidate are classified not_persisted_by_owner_text. Invalid-fixture-only names are negative oracles. Full structural parsing is not a claim of full-document semantic reading.', '',
      'All 21 likely, 5 contested and 219 ambiguous generator names outside August and registry are accounted for (245 total). CLASSIFIED.jsonl contains one sorted row per examined exact token, its current `path:start-end` citations, discovery sources, occurrence count, and any unchanged historical membership. SKIPPED.jsonl is the explicit subset handled by mechanical classes; every skipped name and its rule are listed. Command/control IDs are classified individually by namespace or exact current binding, rather than silently discarded.', '',
      '### Classifications','', '| Classification | All examined | Outside August and registry |','|---|---:|---:|']
    for k,v in meta['classification_counts'].items():lines.append(f"| {k} | {v} | {meta['outside_classification_counts'].get(k,0)} |")
    lines+=['',f"**Total:** {meta['classified_count']} names; {meta['outside_august_and_registry']} outside both old sets.",'','### Mechanical exclusions','', '| Rule | Names |','|---|---:|']
    for k,v in meta['skip_rule_counts'].items():lines.append(f'| {k} | {v} |')
    lines+=['','Rules apply to whole mechanical classes: filenames/versioned contract or key IDs; explicit property/config/schema/role namespaces; code member access; and exact reviewed field, setting, enum, profile or selector bindings. Known event identities and explicit owner lists take precedence. A field suffix such as `payload.*` never creates another family. No claim of event semantics rests only on a terminal verb.','', '## Persisted candidate buckets','', '| Bucket | Definition | All current unregistered candidates | Frozen NEW-LIST only |','|---|---|---:|---:|']
    labels={'a':'Already in August ledger / the 236','b':'The 51 Browser names (DL-046)','c':'The 18 collaborative names (DL-090/091)','d':'The exact 35 Card 4b names (32 outside registry)','e':'Outside every preceding set; returns to Jared'}
    for b in 'abcde':lines.append(f"| {b} | {labels[b]} | {meta['all_unregistered_persisted_candidate_buckets'][b]} | {meta['new_list_bucket_counts'][b]} |")
    lines+=['', f"The live registry has {meta['live_registered_observed']} names and is observed separately, not re-admitted. NEW-LIST contains **{len(new)}** sorted unique objects and excludes all August and live-registry names by definition, so its bucket (a) count is zero. The three registered Card 4b families remain outside this new-list universe. All 51 Browser and all 18 collaborative names are present. `collaboration.failed` is already decided by DL-091 despite its omission from section 13 (Plans/Decision_Log.md:2094-2110); it is not new scope. `chat.response_stop_requested` is already in August and is the accepted request spelling under DL-406. Conditional memory and Stop-outcome retirements preserve their prerequisites; this report neither applies them nor drops their old records.", '',
      f"L9 found 101 outside names. All remain in this list. The corrected full recount adds {meta['new_list_bucket_counts']['e']} supported bucket (e) names, including block-list names the cue-window generator misses. That is a discovery delta, not proof of active producers. Five previously counted readiness labels remain unresolved and visible below. The proposed exclusion of `planning.question_budget_exhausted` and all four exact `continuity.*` source names remain counted; no proposal is a completed disposition.", '',
      '## Bucket (e): exact return list for Jared','',
      'Each row names the proposed owner and section, what the event records, the closest Card 1 group, and the recommendation. **Retention analogies are proposals only.** DL-401 applied to the named card groups, not every future same-looking event. The card legend (as-presented file:29-36) supplies the rules. Keep retains references without copying bodies; Run year requires a real run and cannot borrow an external pipeline or invent a run; no-project 7-year history needs an explicit counting-bucket decision unless already named. Holds, recovery anchors, latest-25-run protection, live refs and backups override expiry (card:38). An owner must settle any incompatible anchor/scope before admission. A merge recommendation does not assert an alias or choose between owners.', '',
      '| Name | Owner / section | Records | Closest retention group | Recommendation and reason |','|---|---|---|---|---|']
    for r in new:
        if r['bucket']!='e':continue
        rec=r['recommendation'];action=rec['action']+(' → '+rec['target'] if 'target'in rec else '')
        cites='; '.join(r['citations'])
        details=rec['reason']
        for key in ('status','target_status','condition','question'):
            if key in rec:details+=' '+rec[key]
        if rec.get('citations'):details+=' Evidence: '+'; '.join(rec['citations'])+'.'
        lines.append(f"| `{r['name']}` | {r['owner_document']} — {r['owner_section']}<br>{cites} | {r['records']} | {r['closest_card1_retention_group']} | **{action}**. {details} |")
    lines+=['','### Retention rules used by those analogies','', '| Group | Card rule | Exact rule summary |','|---|---|---|']
    used=sorted({r['closest_card1_retention_group'] for r in new if r['bucket']=='e'})
    for g in used:lines.append(f'| {g} | {GROUP_RULE[g]} | {RULES[GROUP_RULE[g]]} |')
    lines+=['','## Unresolved persistence questions','',
      'All six remain `undetermined` in CLASSIFIED.jsonl, with no bucket or disposition recommendation. The five readiness labels are not approved exclusions. Investigation owners search existing canon; a decision to add history or resolve competing owners belongs to Jared. No answer or option is selected.','']
    for r in classified:
        if r['classification']!='undetermined':continue
        lines += [f"### `{r['name']}`",'',f"Investigation owner: **{r['investigation_owner']}**. Decision owner: **{r['decision_owner']}**.",'',r['question'],'']
        if 'owner_search' in r:
            s=r['owner_search']
            lines += [f"Search: {s['scope']}; {s['documents_searched']} owner documents, **zero exact-name matches**. No existing owner answer was found. {s['related_contract_result']}",'']
        for option in r.get('options',[]):
            title,body=option.split('. ',1)
            lines.append(f'- **{title}.** {body}')
        if r.get('options'):lines.append('')
        lines+=['Evidence: '+'; '.join(r['citations'])+'.','']
    lines+=['### Provenance versus route: semantic question, candidate retained','',PROVENANCE_QUESTION,'',
      'Evidence: Plans/orchestrator-subagent-integration.md:31726-31733; Plans/Contracts_V0.md:20541-20549; Plans/Contracts_V0.md:17769-17815. `continuity.provenance_recorded` remains a supported candidate in bucket (e). The unsupported route_resolved merge is withdrawn. The other three continuity pairings are conditional proposals onto August `quarantined_not_admitted` rows, not aliases or registered-family targets.','', '## Open August names absent today','',
      'None. All 236 exact names in the supplied TSV occur in the current Plans scan. Therefore there is no absent-name/replacement table and no disposition changes. Card 2 retirements still appear in today’s text; presence is not a claim that their future writers survive. The complete exact-presence check is reproduced by recount.py and the zero absent count is in RECEIPT.json.', '',
      '## Where the frozen seal check reads','',
      'The frozen validator hard-codes the August audit home, individual ledger and census path, then `DENOM = .../closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` (Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:22-30). It requires that denominator and `CURRENT_SOURCE_INVENTORY.json` (same validator:529-536), loads both directly (563-568), and compares the admitted exact set to the individual-disposition ledger (937-1005). It checks stored freeze-digest equality (1021-1040) and makes closure, partition/count agreement and that equality prerequisites to complete_denominator_known (1630-1646). Its receipt hashes the old artifacts (1689-1694). It never reads this reports directory or NEW-LIST.', '',
      'The frozen census itself pins 180 sources and the August digest (Plans/.audits/event-authority-2026-08-12/closed-world-census/CURRENT_SOURCE_INVENTORY.json:1-8). Its denominator stores the same pin and an old admitted set (Plans/.audits/event-authority-2026-08-12/closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json:1-14). The census delta explicitly distinguishes the fresh source digest, requires a rescan rather than mixed snapshots, and forbids a freeze re-stamp (Plans/.audits/event-authority-2026-08-12/closed-world-census/FRESH_CENSUS_DELTA.md:39-50). The validator compares stored pins rather than rehashing the current corpus: retaining an old matching pin beside new membership would not make this new source snapshot an honestly frozen August census.', '',
      '**Task 6 answer:** preserving August history requires an explicitly authorized change to the seal check to consume this separate freeze; replacing its frozen source pin instead would require the forbidden re-stamp, so Card 4a’s open consequence returns to Jared. DL-412’s separate multi-family-admission amendment does not authorize this denominator change. Neither change was made, and the writing frozen validator was not run.', '',
      '## Review round 1: findings and responses','',
      f"Review: `{ev/'reviews/CA-COUNT-sol/REVIEW.md'}`; SHA-256 `{PINNED_EXTERNAL_INPUTS['reviews/CA-COUNT-sol/REVIEW.md']}`. Reviewed head: `{REVIEWED_HEAD}`. Fix commit: this six-file result's HEAD, whose parent is that reviewed head. The source corpus stays at the same MAIN_SHA.",'',
      '| Finding | Response | Verification |','|---|---|---|',
      f"| 1 — Readiness labels | Fixed: five names move from supported bucket (e) to undetermined, retained with exact owner questions and negative/live-related search evidence. No existing exact-spelling owner answer was found. | {implementation_ref('READINESS_RESEARCH=')}; {implementation_ref('def adjudicate(')}; six unresolved rows in CLASSIFIED; five fewer NEW-LIST objects. |",
      f"| 2 — Cancellation owner | Fixed routing; product cell stopped for Jared. Exact question and both verbatim options above; Orchestration + Storage investigate, Jared decides. | {implementation_ref('CANCEL_QUESTION=')}; {implementation_ref('CANCEL_OPTIONS=')}; subagent.cancel_requested stays undetermined, with no bucket. |",
      f"| 3 — Continuity and optional planning event | Unsupported provenance-to-route merge removed; semantic cell stopped for Jared. Three other merges are conditional proposals onto unadmitted August rows. Goal readiness label follows finding 1. Optional planning exclusion remains a recommendation. | {implementation_ref('def recommendation(')}; all four continuity names and planning.question_budget_exhausted remain in bucket (e). |",
      f"| 4 — Structural discovery | Fixed: expanded semantic keys and embedded-token extraction. Four reviewed labels explicitly classified as concept lineage or negative fixtures. Additional command receipts and a filename are accounted for below. | {implementation_ref('SEMANTIC_EVENT_KEY=')}; {implementation_ref('def extract(')}; {implementation_ref('MISSED_LABELS=')}; two complete replays. |",
      '| 5 — Frozen citation | Fixed to FRESH_CENSUS_DELTA.md:39-50. Task 6 conclusion stands. | Citation bounds checked; frozen validator/census unchanged. |','',
      'Family grades before/after: no family contract or admission is authored by this reports-only lane; twelve-criterion family grades are inapplicable. Recount assessment changes from review NOT_READY to fixes mechanically verified, pending independent re-review. Product questions remain open. IDs used: none. Check 11 family guard-removal table is inapplicable: there is no family checker or positive/negative contract fixture in this lane. Discovery and classification invariants are verified by complete replay and the changes below.','',
      '### Every bucket (e) change','',
      '| Name | Before | After |','|---|---|---|']
    changes=meta['round1_changes']
    for n in changes['bucket_e_removed_to_unresolved']:
        lines.append(f'| `{n}` | Supported candidate in (e) | Undetermined; retained in CLASSIFIED and unresolved list; no exclusion, registration or merge. |')
    for n in changes['bucket_e_added']:
        lines.append(f'| `{n}` | Outside (e) | New supported candidate in (e); see cited owner evidence above. |')
    for change in changes['bucket_e_recommendation_changes']:
        old=change['before'];cur=change['after']
        before=old['action']+(' → '+old['target'] if 'target' in old else '')
        after=cur['action']+(' → '+cur['target'] if 'target' in cur else '')
        if 'status' in cur:after+='; '+cur['status']
        if 'target_status' in cur:after+='; '+cur['target_status']
        lines.append(f"| `{change['name']}` | {before} | {after}"+('' if 'remains counted' in after else '; still counted')+'. |')
    lines+=['',f"Bucket (e): 153 → {meta['new_list_bucket_counts']['e']}; {len(changes['bucket_e_removed_to_unresolved'])} moved to unresolved, {len(changes['bucket_e_added'])} added. All other bucket (e) rows and recommendations are unchanged. Classification changes among previously examined names: "+'; '.join(f"`{r['name']}`: {r['before']} → {r['after']}" for r in changes['classification_changes'])+'.','',
      '### Four previously missed labels','',
      '| Name | Classification and evidence |','|---|---|']
    for n,(kind,note,refs) in MISSED_LABELS.items():
        lines.append(f'| `{n}` | not_persisted_by_owner_text; {kind}. {note} Evidence: '+ '; '.join(refs)+' |')
    added=changes['newly_examined']
    lines+=['',f"Extended discovery examines {len(added)} additional names. Added classifications: "+', '.join(f'{k}={v}' for k,v in sorted(collections.Counter(r['classification'] for r in added).items()))+'. No formerly examined name is dropped. Every additional exact name follows; command receipts remain command/action identities, not new EventRecord families. These additions change discovery/classification totals, not supported candidate membership.','',
      '| Newly examined exact name | Classification | Current evidence |','|---|---|---|']
    for r in added:
        lines.append(f"| `{r['name']}` | {r['classification']} | "+'; '.join(r['citations'])+' |')
    lines+=['',
      '### Checks and current-brief probes','',
      '| Check | Exit / result |','|---|---|',
      '| Two stock currentness generations | 0 each; all 14 checks true; event_authority_closed=false. |',
      '| Corrected recount CLI | 0; two full extraction/adjudication procedures agree on NEW-LIST, CLASSIFIED, SKIPPED and counts. |',
      '| Exact retained-row comparison with reviewed head | PASS; only the five recommendation objects listed above change among retained NEW-LIST rows. |',
      '| Input/output custody and citation audit | PASS; all 590 input pins, 14 generator-output pins, four output pins, sorted membership, questions/options, citations and six-path scope verified. |',
      '| Full CLI with forged, uppercase or space-suffixed briefing digest (in-memory mutation, no source edits) | Each rejects at external input drift before extraction or output. |',
      '| Attempt to obtain a disposition recommendation for each unresolved readiness label | All five reject; no register/merge/exclude recommendation exists. |',
      '| Shared briefing updated during this fix | Initial replay refused BRIEF-DRAFT input drift; reread both changed briefings and pin their new bytes. Plans and semantic source SHA did not change. |',
      '| git diff --exit-code MAIN_SHA -- Plans scripts; git diff --check | 0; product canon, shared scripts, frozen census and validator untouched; no whitespace defects. |','',
      'The 22:00Z shared-brief defect classes were checked against this lane: (1) forged input pins reject in the full CLI mutation above; (2) no Storage-assigned event metadata is interpreted; (3) no writer or historical reader is implemented and August dispositions remain unchanged; (4) uppercase/space-suffixed digest representations reject; (5) the recount does not resolve or validate schemas, and schema/reference files are unchanged; (6) no stored event body or payload size contract is edited; (7) both generator source heads, exact occurrence bytes, unchanged Plans/scripts and input hashes are checked before a receipt is emitted; (8) no family fixture/guard oracle exists in this reports-only lane, so the family guard-removal table has no applicable rows; (9) no family depth PASS or admission is claimed. These scope limits do not certify any runtime contract.','',
      '## Freeze and replay evidence','',
      f"NEW-LIST exact bytes: SHA-256 `{receipt['new_list_sha256']}`, {receipt['new_list_bytes']} bytes. Two independently regenerated currentness outputs and two full extraction/adjudication runs produce byte-identical NEW-LIST, CLASSIFIED and SKIPPED bytes. Generator occurrence bytes also match; generator timestamps legitimately differ. RECEIPT.json records both output digest sets, each input’s exact SHA-256, classification/cohort counts and the UTC receipt time.", '',
      'Reproduce from this source revision (with the designated ignored currentness edition copied and verified first):','', '```bash',
      'python3 scripts/pm-event-authority-currentness.py generate --outdir <empty-external-first>',
      'python3 scripts/pm-event-authority-currentness.py generate --outdir <empty-external-second>',
      'python3 reports/event-authority-20261104/census-recount-20261104/recount.py --root . --generator <first> --replay-generator <second> --outdir <external-result>', '```', '',
      'The script checks unchanged Plans/scripts against the pinned revision, exact membership cardinalities, sorted uniqueness, every mandatory queue token, citation range validity, and equality of the two full procedures. It refuses an unclassified remainder. `NEW-LIST` contains no timestamps or machine-specific checkout path. Input and generator evidence custody is explicit; this receipt does not re-stamp any August artifact.', '',
      'Raw generator evidence retained for this result (paths and SHA-256; all other temporary work is removed):','']
    for g in receipt['generators']:
        base=Path(g['command'][-1])
        for path,digest in g['output_digests'].items():lines.append(f'- `{base/path}` — `{digest}`')
    lines+=['','## Delivered scope','', 'Only REPORT.md, NEW-LIST.json, RECEIPT.json, CLASSIFIED.jsonl, SKIPPED.jsonl and recount.py are committed. No Plans, Decision Log, registry, admission record, seal checker, governance artifact or August fingerprint is edited. The branch is pushed without landing main; the required detached worktree is removed after the evidence copy.']
    return '\n'.join(lines)+'\n'

if __name__=='__main__': main()
