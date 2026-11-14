#!/usr/bin/env python3
"""DG-INT CF-10/P4: legacy whole-source admission in the combined certified reducer (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

DG-CF3 closed the certified branch, every transition and halt, the
expired-Start survivor proof and the whole global prefix; its one open item
was admitting the legacy old-profile and native-v7 Start and positive
cancellation from their whole sources. ``project_prefix.reference.v1`` names
that input exactly: ``legacy_sources`` is a ``LegacyProjectionEvidence`` whose
``originals`` is an ``OriginalLegacySet`` (profile-tagged lists of whole
``OriginalStarted`` / ``OriginalCancelled``) plus the native-v7 companions.

This module:

* acquires that evidence independently from the source owners (DG-S's S1/S2
  retained reader for every Start, DG-R's R2 passive consumer for every
  positive cancellation) in the same coordinated acquisition as CF3's generic
  source and cell snapshot (``LegacySources``), and validates it whole in the
  certified consumer realm;
* admits each same-run ``goal_run.started`` / ``goal_run.cancelled`` row only
  from that evidence (``reduce_prefix``): dispatch on the run's installed
  profile, read from the Storage-held installed descriptor; validation of the
  whole original in its own realm (W4 bank for the original profile, the W5
  source-package.v2 companion bank for native-v7); equality of the event,
  first receipt, exact custody and commitment with the actual frame; every
  original wrapper must be a Storage cell of the same snapshot (located by its
  exact SHA-256, so a substituted or unstored value halts); the native
  transition, payload revisions and Goal revision; causal order; and, for a
  cancellation of a started run, the cancellation's start cause must be the
  very Start the prefix admitted. Certified rows keep CF3's ``_certified_record``;
* runs CF3's own ``derive``, lower publisher, projector and reader code
  unchanged, rebound (``types.FunctionType`` over the same code objects) to
  this reducer and source acquisition, so no lane file is edited.
"""
from __future__ import annotations

import copy
import json
import types

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GS
import pm_goal_dg_s_world as SW
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_readers as SR
import pm_goal_dg_r_world as RW
import pm_goal_dg_r_readers as RR
import pm_goal_dg_cf3_world as W3
import pm_goal_dg_cf3_projector as P3

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
halt = P3.halt
Halt = P3.Halt
OLD, V7 = 'original_started_cancelled', 'all_writers.v7'
PROFILE_OF_DESCRIPTOR = {'workflow_start_original.v2': OLD}
D05_CODEC = 'messagepack_canonical'


REGISTERED, UNKNOWN_DISPOSITION = GS.event_family_registration()


def v7_descriptor_profile():
    return SW.v7_edition().profile


def run_profile(cells, scope, sid):
    """The run's installed profile, from the Storage-held Start installed descriptor (exactly one)."""
    table = cells.get('workflow_start_installed_descriptor', {})
    prefix = 'workflow_start_installed_descriptor:%s:' % W3.K(sid)
    found = [c['value'] for k, c in table.items() if k.startswith(prefix)]
    halt('legacy/descriptor_unavailable', len(found) == 1)
    profile = found[0].get('coordinator_profile') or found[0].get('record', {}).get('coordinator_profile')
    if profile in PROFILE_OF_DESCRIPTOR:
        return PROFILE_OF_DESCRIPTOR[profile]
    halt('legacy/descriptor_profile', profile == v7_descriptor_profile())
    return V7


def stored(cells, value, sid, code):
    """The unique Storage cell holding exactly ``value``: (family, key, selector)."""
    digest = W3.value_sha(value)
    hits = [(t, k) for t, rows in cells.items() for k, c in rows.items() if W3.value_sha(c['value']) == digest]
    halt(code, len(hits) == 1)
    family, key = hits[0]
    return family, key, dict(storage_instance_id=sid, family_id=family, physical_key=key,
                             schema_id=value['schema_id'], schema_version=value['schema_version'],
                             physical_value_sha256=digest)


def d05_selector(cells, value, sid, code):
    family, key, sel = stored(cells, value, sid, code)
    return dict(storage_instance_id=sid, family_id=family, schema_id=value['schema_id'],
                schema_version=value['schema_version'], physical_key=key, physical_sha256=sel['physical_value_sha256'],
                codec=D05_CODEC)


def realm_roots(profile):
    from pm_goal_dg_int_roots import Roots
    return Roots.get() if profile == V7 else RW.Roots.get()


def validate_whole(profile, root, value, code):
    try:
        realm_roots(profile).validate('native_consumer', RW.C + root, value, code)
    except RW.Refusal as error:
        raise Halt(error.code) from None


def _entries(legacy, kind, event_id):
    out = []
    for group in legacy['originals']:
        for item in group[kind]:
            ev = item['original_append']['event'] if kind == 'started' else item['original_value']['event']
            if ev['event_id'] == event_id:
                out.append((group['profile'], item))
    return out


def _start_record(state, row, scope, cells, sid, legacy):
    ev = row.event
    halt('reducer/start_after_terminal', state['terminal'] is None)
    halt('reducer/duplicate_start', state['start'] is None)
    custody = P3._common_original(row, ev)
    entries = _entries(legacy, 'started', ev['event_id'])
    halt('legacy/start_without_original', len(entries) == 1)
    profile, original = entries[0]
    halt('legacy/start_profile', profile == run_profile(cells, scope, sid))
    validate_whole(profile, 'OriginalStarted', original, 'legacy/started_root')
    if profile == V7:
        halt('legacy/v7_companion_missing', any(P3.exact(c, original['native_start'])
                                                for c in legacy['native_v7_starts']))
    append, n = original['original_append'], original['native_start']
    halt('legacy/start_event', P3.exact(append['event'], ev))
    halt('legacy/start_receipt', P3.exact(append['first_append_receipt'], row.receipt))
    halt('legacy/start_custody', P3.exact(append['exact_custody'], custody))
    c = n['commit']['record']
    halt('legacy/start_commit_event', c['event_id'] == ev['event_id'] and
         P3.exact(c['first_append_receipt'], row.receipt) and
         P3.exact(c['event_value_commitment'], custody['original_event_value_commitment']))
    sels = {name: stored(cells, n[name], sid, 'legacy/start_unstored/' + name)[2] for name in n}
    update = n['original_d01_update']['record']
    before, after = update['transition']['before'], update['transition']['after']
    halt('legacy/start_transition', before['status'] == 'ready' and after['status'] == 'running' and
         after['activation_state'] == 'active' and after['body_revision'] == before['body_revision'] + 1)
    p = ev['payload']
    halt('legacy/start_revisions', p['expected_goal_run_revision'] == before['body_revision'] and
         p['goal_run_revision'] == after['body_revision'])
    halt('legacy/start_goal_revision', p['goal_revision'] == c['goal_context']['goal_revision'])
    halt('legacy/start_d01_join', P3.exact(update['original_owner_result'], sels['commit']) and
         P3.exact(update['original_owner_origin'], sels['origin']))
    record = dict(scope=copy.deepcopy(scope), status_at_original_event='running', activation_at_original_event='active',
                  original_event=copy.deepcopy(ev), native_after_commitment=copy.deepcopy(after),
                  captured_goal_context=copy.deepcopy(c['goal_context']), original_commit=sels['commit'],
                  original_origin=sels['origin'], original_d01_update=sels['original_d01_update'],
                  original_d01_origin=sels['original_d01_origin'],
                  original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                  producer_semantic_digest=custody['producer_semantic_digest'],
                  first_append_receipt=copy.deepcopy(row.receipt), action_authority=False)
    state['start'] = dict(event_id=ev['event_id'], sequence_id=row.sequence_id, after=copy.deepcopy(after),
                          commit=sels['commit'], profile=profile)
    state['status'] = 'running'
    state['record'] = record


def _cancel_record(state, row, scope, cells, sid, gaps, legacy):
    ev = row.event
    halt('reducer/second_terminal', state['terminal'] is None)
    custody = P3._common_original(row, ev)
    entries = _entries(legacy, 'cancelled', ev['event_id'])
    halt('legacy/cancel_without_original', len(entries) == 1)
    profile, original = entries[0]
    halt('legacy/cancel_profile', profile == run_profile(cells, scope, sid))
    validate_whole(profile, 'OriginalCancelled', original, 'legacy/cancelled_root')
    if profile == V7:
        halt('legacy/v7_companion_missing', any(P3.exact(c, original['native_cancellation'])
                                                for c in legacy['native_v7_cancellations']))
    value, n = original['original_value'], original['native_cancellation']
    halt('legacy/cancel_event', P3.exact(value['event'], ev))
    result = n['result']['record']
    halt('legacy/cancel_receipt', P3.exact(result['append_receipt'], row.receipt))
    halt('legacy/cancel_commitment', P3.exact(result['original_event_value'], custody['original_event_value_commitment']))
    halt('legacy/cancel_producer', n['event_candidate'] is not None and
         P3.exact(n['event_candidate']['record']['producer_submission'], S.producer25(ev)))
    sel = lambda name, code=None: stored(cells, n[name], sid, code or 'legacy/cancel_unstored/' + name)[2]  # noqa: E731
    update = n['original_d01_update']['record']
    before, after = update['transition']['before'], update['transition']['after']
    halt('legacy/cancel_transition', after['status'] == 'cancelled' and before['status'] != 'certified' and
         after['body_revision'] == before['body_revision'] + 1)
    p = ev['payload']
    halt('legacy/cancel_revisions', p['expected_goal_run_revision'] == before['body_revision'] and
         p['goal_run_revision'] == after['body_revision'])
    start = n['original_start']
    sv = start['value']
    if start['kind'] == 'original_started':
        cause_sels = {k: stored(cells, sv[k], sid, 'legacy/cause_unstored/' + k)[2] for k in (
            'control', 'initial_control_origin', 'candidate', 'commit', 'origin', 'original_d01_update',
            'original_d01_origin', 'original_d01_head')}
        if state['start'] is not None:
            s = state['start']
            halt('legacy/causal_order', s['sequence_id'] < row.sequence_id and
                 s['after']['body_revision'] <= before['body_revision'])
            halt('legacy/cause_is_admitted_start', P3.exact(cause_sels['commit'], s['commit']))
        else:
            # No admitted Start in this prefix: an authenticated retention gap must cover the Start's sequence.
            start_sequence = sv['commit']['record']['first_append_receipt'].get('sequence_id', -1)
            covered = [g for g in gaps if g['first_sequence'] <= start_sequence <= g['last_sequence']]
            halt('legacy/cancel_without_start_proof', len(covered) == 1)
        cause = dict(kind='original_started', **cause_sels)
    else:
        halt('legacy/initialized_no_start_after_start', state['start'] is None)
        cause = dict(kind='original_initialized_no_start', **{k: stored(cells, sv[k], sid, 'legacy/cause_unstored/' + k)[2]
                                                              for k in ('control', 'initial_control_origin',
                                                                        'original_workflow_birth',
                                                                        'original_workflow_birth_origin')})
    ss = n['original_safe_stop']
    record = dict(scope=copy.deepcopy(scope), status_at_original_event='cancelled',
                  activation_at_original_event=after['activation_state'], original_event=copy.deepcopy(ev),
                  native_before_commitment=copy.deepcopy(before), native_after_commitment=copy.deepcopy(after),
                  original_candidate=sel('event_candidate'), original_intent=sel('intent'),
                  original_result=sel('result'), original_prepare_origin=sel('prepare_origin'),
                  original_publish_origin=sel('publish_origin'), original_d01_update=sel('original_d01_update'),
                  original_d01_origin=sel('original_d01_origin'), original_d01_head=sel('original_d01_head'),
                  original_d05_result=d05_selector(cells, ss['aggregate_result'], sid, 'legacy/d05_unstored/result'),
                  original_d05_origin=d05_selector(cells, ss['aggregate_origin'], sid, 'legacy/d05_unstored/origin'),
                  original_start_cause=cause,
                  original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                  producer_semantic_digest=custody['producer_semantic_digest'],
                  first_append_receipt=copy.deepcopy(row.receipt), action_authority=False)
    state['terminal'] = 'cancelled'
    state['status'] = 'cancelled'
    state['record'] = record


def _certified_record(state,row,scope,cells,sid,gaps,originals,legacy):
    """Reduce the actual whole v7 Release chain acquired in this snapshot."""
    halt('reducer/second_terminal',state['terminal'] is None)
    ev=row.event;custody=P3._common_original(row,ev)
    matches=[o for o in originals if o['original_event']['event']['event_id']==ev['event_id']]
    halt('certified/whole_original_missing',len(matches)==1)
    original=matches[0]
    P3.representation().validate('OriginalCertifiedSet',[original],original=True)
    n=original['native'];event=original['original_event'];coord=n['coordinator']
    halt('certified/whole_event',P3.exact(event['event'],ev) and P3.exact(event['exact_custody'],custody) and
         P3.exact(event['first_append_receipt'],row.receipt))
    sels={}
    members=dict(native_result=n['native']['result'],native_origin=n['native']['origin'],
        d01_update=n['d01']['original_update'],d01_head=n['d01']['original_head'],d01_origin=n['d01']['original_origin'],
        standard_receipt=n['standard'],standard_capture_origin=n['standard_capture_origin'])
    for name,value in members.items():
        family,key,selection=stored(cells,value,sid,'certified/unstored/'+name)
        sels[name]=selection
        if name not in ('standard_receipt','standard_capture_origin'):
            halt('certified/joint_transaction/'+name,cells[family][key]['tx']==coord['commit']['record']['transaction_id'])
    for family,value in coord.items():
        _,_,sels['coordinator_'+family]=stored(cells,value,sid,'certified/unstored/coordinator/'+family)
    c=coord['commit']['record'];intent=coord['intent']['record'];release=coord['release']['record']
    for name in ('native_result','native_origin','d01_update','d01_head','d01_origin'):
        halt('certified/commit_selects/'+name,c[name]==dict(key=sels[name]['physical_key'],sha256=sels[name]['physical_value_sha256']))
    halt('certified/released',coord['control']['record']['phase']=='released' and
         release['commit']==dict(key=sels['coordinator_commit']['physical_key'],sha256=sels['coordinator_commit']['physical_value_sha256']))
    upd=members['d01_update']['record'];before,after=upd['transition']['before'],upd['transition']['after']
    halt('certified/native_transition',upd['cause']=='completion_certification' and
         upd['transition']['rule']=='original_standard_certification' and before['status'] in ('provisional_success','verifying') and
         after['status']=='certified' and after['body_revision']==before['body_revision']+1 and
         after['activation_state']==before['activation_state']=='active' and
         after['activation_revision']==before['activation_revision'])
    halt('certified/payload_revisions',ev['payload']['expected_goal_run_revision']==before['body_revision'] and
         ev['payload']['goal_run_revision']==after['body_revision'])
    halt('certified/whole_native_origin',members['native_origin']['record']['result']==sels['native_result'] and
         upd['original_owner_result']==sels['native_result'] and upd['original_owner_origin']==sels['native_origin'])
    halt('certified/commit_native',before['body']['physical_value_sha256']==intent['native_before_body']['sha256'] and
         after['body']['physical_value_sha256']==c['native_after_body']['sha256'])
    if state['start'] is None:
        survivors=[]
        for retained in legacy['native_v7_starts']:
            commit=retained['commit']['record']
            seq=commit['first_append_receipt']['sequence_id']
            covered=[g for g in gaps if g['first_sequence']<=seq<=g['last_sequence']]
            if len(covered)==1 and seq<row.sequence_id:survivors.append((retained,seq))
        halt('certified/whole_start_survivor_missing',len(survivors)==1)
        retained,seq=survivors[0]
        sels0={name:stored(cells,value,sid,'certified/survivor/unstored/'+name)[2] for name,value in retained.items()}
        sc,so,cc,su,sh=(retained[name]['record'] for name in ('commit','origin','candidate','original_d01_update','original_d01_head'))
        halt('certified/survivor/control',retained['control']['record']['committed_start']==sels0['commit'])
        halt('certified/survivor/original_chain',sc['candidate']==so['candidate']==sels0['candidate'] and so['commit']==sels0['commit'] and
             su['original_owner_result']==sels0['commit'] and su['original_owner_origin']==sels0['origin'])
        halt('certified/survivor/whole_transition',su['transition']['before']['status']=='ready' and
             su['transition']['after']['status']=='running' and su['transition']['after']['activation_state']=='active' and
             su['transition']['after']['body_revision']==su['transition']['before']['body_revision']+1 and
             cc['candidate_body']==sc['after_body']==sh['current_body']==su['after_body'])
        state['start']=dict(sequence_id=seq,event_id=sc['event_id'],after=su['transition']['after'],commit=sels0['commit'],profile=V7)
    halt('certified/causal_order',state['start']['sequence_id']<row.sequence_id and
         state['start']['after']['body_revision']<=before['body_revision'])
    record=dict(scope=copy.deepcopy(scope),status_at_original_event='certified',activation_at_original_event='active',
        original_event=copy.deepcopy(ev),native_before_commitment=copy.deepcopy(before),native_after_commitment=copy.deepcopy(after),
        original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
        producer_semantic_digest=custody['producer_semantic_digest'],first_append_receipt=copy.deepcopy(row.receipt),action_authority=False)
    for name in ('native_result','native_origin','d01_update','d01_origin','d01_head','standard_receipt','standard_capture_origin',
                 'coordinator_commit','coordinator_origin','coordinator_release'):record['original_'+name]=sels[name]
    P3.representation().validate('CertifiedProjection',record,original=True)
    state.update(terminal='certified',status='certified',record=record)


def reduce_prefix(generic, scope, cells, *, limit=None, through=None):
    """CF3's bounded reducer with legacy started/cancelled rows admitted from whole sources."""
    P3.require('reduce/snapshot_type', isinstance(generic, P3.SourceSnapshot))
    legacy = getattr(generic, 'legacy', None)
    P3.require('reduce/legacy_sources', legacy is not None)
    sid = generic.storage_instance_id
    P3.require('reduce/storage', scope['storage_instance_id'] == sid)
    state = dict(status=None, start=None, terminal=None, record=None)
    pairs, last, stop = [], None, None
    rows = generic.rows
    for row in rows:
        if limit is not None and len(pairs) >= limit:
            break
        if through is not None and row.sequence_id > through:
            break
        try:
            halt('reducer/pending_custody', row.custody is not None)
            ev = row.event
            halt('reducer/unregistered_record', (ev['event_type'],ev['scope_kind'],ev['payload_schema_id']) in REGISTERED)
            payload = ev.get('payload') or {}
            inner = payload.get('payload') if isinstance(payload.get('payload'), dict) else {}
            run = ev['run_id'] if ev['run_id'] is not None else inner.get('goal_run_id')
            same = ev['project_id'] == scope['project_id'] and run == scope['goal_run_id']
            if same:
                halt('reducer/unsupported_same_run', ev['event_type'] in P3.SUPPORTED)
                if ev['event_type'] == 'goal_run.started':
                    _start_record(state, row, scope, cells, sid, legacy)
                elif ev['event_type'] == 'goal_run.cancelled':
                    _cancel_record(state, row, scope, cells, sid, generic.gaps, legacy)
                else:
                    _certified_record(state,row,scope,cells,sid,generic.gaps,getattr(generic,'certifications',[]),legacy)
        except Halt as error:
            stop = (error.code, row.position, row.event_id)
            break
        pairs.append([P3.index_row(row), row.custody['original_event_value_commitment']['sha256']])
        last = row.sequence_id
    exhausted = len(pairs) == len(rows)
    if stop is None and exhausted and generic.defect is not None:
        stop = generic.defect
    gaps = [g for g in generic.gaps if last is not None and g['last_sequence'] < last] if generic.gaps else []
    if gaps and last is not None:
        last = max(last, max(g['last_sequence'] for g in gaps))
    return dict(record=state['record'], status=state['status'], pairs=pairs, through=last, halt=stop, gaps=gaps,
                complete=stop is None and exhausted)


# ------------------------------------------------------------------ legacy source acquisition

ACQUIRERS = {}


def register(world):
    """Bind the source owners of a cross-family world to its Storage instance."""
    ACQUIRERS[world.storage.storage_instance_id] = world


def acquire_legacy(world):
    """LegacyProjectionEvidence from the actual source owners (never a caller-supplied value)."""
    sw = getattr(world,'start_world',None) or world.sw
    profile = V7 if sw.edition.name=='native_v7' else OLD
    no_start=getattr(world,'start_cause',{}).get('kind')=='original_initialized_no_start'
    retained_start=[]
    if no_start:started=[]
    else:
        retained=SR.retained_native(sw,where='legacy/retained_start')
        event_id=retained['commit']['record']['event_id']
        sequence=retained['commit']['record']['first_append_receipt']['sequence_id']
        # Rebuilding the index removes retired Events. Use the retained
        # original receipt and the actual segment disposition; absence from
        # the live Event index alone never proves lawful expiry.
        retired=any(g['first_sequence']<=sequence<=g['last_sequence'] and
            any(s['generation']==g['segment_generation'] and s['retired'] for s in world.storage.segments)
            for g in world.storage.gaps)
        if retired:
            started=[]
            retained_start=[retained]
        else:started=[SR.original_started(sw,where='legacy/started')]
    cancelled = []
    if getattr(world, 'cancellation', None) is not None and not getattr(world,'preserved',False):
        request = dict(scope={k: world.scope[k] for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id')},
                       storage_instance_id=world.sid)
        cancelled.append(getattr(world,'consumer_class',RR.Consumer)(world).inspect_original(request, RR.Presentation(world)))
    edits = getattr(world, 'legacy_edits', None)
    value = dict(originals=[dict(profile=profile, started=started, cancelled=cancelled)],
                 native_v7_starts=[copy.deepcopy(s['native_start']) for s in started]+retained_start if profile == V7 else [],
                 native_v7_cancellations=[copy.deepcopy(c['native_cancellation']) for c in cancelled]
                 if profile == V7 else [])
    if edits:
        value = edits(value)
    return value


class LegacySources(P3.Sources):
    """CF3's coordinated acquisition plus the legacy whole-source evidence of the same Storage."""

    def __init__(self, storage, scope, controls, *, snapshot=None):
        super().__init__(storage, scope, controls, snapshot=snapshot)
        world = ACQUIRERS.get(storage.storage_instance_id)
        P3.require('sources/legacy_owner_unregistered', world is not None)
        legacy = acquire_legacy(world)
        P3.representation().validate('LegacyProjectionEvidence', legacy, original=True)
        self.legacy = legacy
        self.generic.legacy = legacy
        self.certifications=[]
        native=getattr(world,'certified_world',world)
        op=getattr(native,'certification_operation',None)
        if op is not None:
            from pm_goal_dg_int_certified_reader import Consumer
            scope=native.coord_scope(native.scope)
            self.certifications=[Consumer(native.registry,native).inspect_original(scope,op)['original_certified']]
            P3.representation().validate('OriginalCertifiedSet',self.certifications,original=True)
        self.generic.certifications=self.certifications
        P3.require('sources/final_coordinated_snapshot',storage.cell_generation==self.cell_generation and
            storage.read_token()==self.token)


def _rebind(fn, **names):
    g = dict(fn.__globals__)
    g.update(names)
    out = types.FunctionType(fn.__code__, g, fn.__name__, fn.__defaults__, fn.__closure__)
    out.__kwdefaults__ = fn.__kwdefaults__
    return out


derive = _rebind(P3.derive, reduce_prefix=reduce_prefix)
_NAMES = dict(Sources=LegacySources, derive=derive, reduce_prefix=reduce_prefix)


def _class(base, methods):
    return type('Int' + base.__name__, (base,), {m: _rebind(getattr(base, m), **_NAMES) for m in methods})


IntLowerStorage = _class(P3.LowerStorage, ('read_sources', 'publish', 'collect', '_replay'))
IntProjector = _class(P3.Projector, ('project_prefix',))
IntReader = _class(P3.Reader, ('read',))


class IntConsumer(P3.Consumer):
    """CF3's owner bundle bound to the cross-family world's Storage and registry."""

    def __init__(self, world):
        register(world)
        storage = world.storage
        self.registry = world.registry
        self.storage = storage
        self.controls = P3.ControlOwner(self.registry, storage)
        self.holds = P3.HoldOwner(self.registry, storage)
        self.lower = IntLowerStorage(self.registry, storage, self.controls)
        self.projector = IntProjector(self.registry, self.lower)
        self.reader = IntReader(self.registry, storage, self.controls)


def run_scope(world):
    return dict(storage_instance_id=world.storage.storage_instance_id,
                **{k:world.scope[k] for k in ('project_id','goal_id','goal_run_id')})
