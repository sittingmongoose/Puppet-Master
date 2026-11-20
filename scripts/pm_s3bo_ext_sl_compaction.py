"""C12-SL: storage.compaction_lifecycle_changed complete compaction boundary (SP-295..SP-297).

Owner clauses: Immutable-segment compaction and publication (closed phases, the
builder, publication order with the DL-270 split activation, CURRENT as sole
selector), the Compaction lifecycle event action and exceptional-phase contract
(action domains, phase meanings, complete adjacency, exceptional predicates,
failure_reason, authority order, restart, retry and replay), the Compaction
original native source, phase custody and detail retirement section with
SP-295/SP-296/SP-297 (admission lookup and nonce identity, transition/effect/
artifact recipes, attempts and unproved dispositions, proved-edge events,
historical delivery order, passive reads, terminal settlement, DL-049
RP-COMPACTION-DETAIL-7D eligibility and members, crash-safe retirement,
coherent backup), Plans/storage_compaction_contracts/{phases,identity,guards,
detail-policy}.json (G01-G32) and SP-2206 (passive history consumer).

The boundary record (`case['sl']`) holds one compaction operation's
independently held facts (initiator, nonce, source generation, frozen inputs,
carrier, artifact refs, policy) and every run: admission and retry lookup,
attempted edges with their native-state facts and proofs, action-mode
selection, the native publication sequence, authority and passive reads,
core/removal outcomes, restart, historical delivery, terminal settlement,
detail eligibility, members, retirement and backup restore. Expected outcomes
are derived here from those inputs by the owner rules. Native execution
remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sl_common as s

LANE = 'sl'
CMP = 'storage.compaction_lifecycle_changed'
FAMILIES = (CMP,)
PHASES = w.read_json('Plans/storage_compaction_contracts/phases.json')
ADJ = {k: tuple(v) for k, v in PHASES['adjacency'].items()}
DETAIL = w.read_json('Plans/storage_compaction_contracts/detail-policy.json')
TTL = DETAIL['ttl_seconds']
EXCEPTIONAL = ('recovery_required', 'failed')
TERMINAL = ('finalized', 'failed')
PUBLICATION = ['persist_pending_generation', 'seal_carrier', 'publish_final_manifest', 'sync_manifest_readback',
               'replace_current', 'sync_current_parent', 'activate_derived_index', 'commit_pointers_and_clear_pending',
               'finalize_namespace', 'create_target_active']
ELIGIBLE_KINDS = ('survivor_detail', 'removal_detail', 'translation_detail', 'obsolete_candidate', 'obsolete_carrier_snapshot',
                  'obsolete_publication_snapshot', 'obsolete_index_snapshot', 'resolved_journal', 'obsolete_core_descriptor')
FORBIDDEN_KINDS = ('current', 'live_manifest', 'active_segment', 'pending_control', 'selected_source', 'carrier', 'target_segment',
                   'core_segment', 'original_receipt', 'dedupe', 'terminal_map', 'owner_value')
RETIREMENT = ['authenticate_terminal_and_catalogue', 'create_retirement_intent']
SETTLED_AT = '2026-11-01T00:00:00Z'
PAYLOAD_SCHEMA = w.schema_for(CMP)

ROWS = [
    ('sl_cmp_admission', 'sl_compaction', 'equal', 'Admission resolves the command against live journals and terminal mappings first (rejoin, conflict or unavailable), then mints the nonce compaction_id with target generation exactly source + 1 and the carrier outside the frozen inputs.'),
    ('sl_cmp_graph', 'sl_compaction', 'equal', 'Every reserved edge is in the complete adjacency from the last proved phase; initial preparing has ordinal zero and no edge leaves finalized or failed.'),
    ('sl_cmp_phase', 'sl_compaction', 'equal', 'An edge is proved only with its phase postcondition: frozen header, source-authoritative build and verification, durable pending with unchanged CURRENT, target CURRENT with complete activation, complete finalization, proven source authority for failed, ambiguity for recovery_required.'),
    ('sl_cmp_disposition', 'sl_compaction', 'equal', 'An unprovable reservation is closed without observation and the actual exceptional successor is proved from the last proved phase at a fresh ordinal; ordinals never repeat.'),
    ('sl_cmp_identity', 'sl_compaction', 'equal', 'Transition ids and the evt_storage_compaction_ event id and key follow the HMP recipe over compaction_id, ordinal, predecessor, from and to.'),
    ('sl_cmp_event', 'sl_compaction', 'equal', 'The frozen producer joins the header refs, policy and selected modes, carries failure_reason only for recovery_required and failed, the initiator actor and correlation and the proof capture time.'),
    ('sl_cmp_actions', 'sl_compaction', 'equal', 'translate_by_semantic_identity only with a matching survivor digest and every position resolved by semantic identity; activate_verified_target_shadow only with a complete verified target shadow.'),
    ('sl_cmp_aftermath', 'sl_compaction', 'equal', 'Committed and finalized apply the selected outcomes, only finalized claims success, recovery_required stays fenced, failed activates nothing, and no phase deletes the old source.'),
    ('sl_cmp_publication', 'sl_compaction', 'equal', 'Publication persists pending, seals the carrier, publishes and reads back the manifest, replaces and syncs CURRENT, activates the derived index before the pointer commit, then finalizes.'),
    ('sl_cmp_authority', 'sl_compaction', 'equal', 'Reads select only what synchronized CURRENT selects, never a staged_prefix entry, mtime or lifecycle event, report last-proven history separately and have no effect.'),
    ('sl_cmp_core', 'sl_compaction', 'equal', 'Every frozen input event has exactly one survivor or removal outcome, removal needs policy evidence and no current row, survivors keep their bytes and carrier events are outside the outcome set.'),
    ('sl_cmp_restart', 'sl_compaction', 'equal', 'Restart resumes the same identity at the next proved edge or enters recovery_required, stays fenced in recovery_required, returns a terminal result unchanged and never repeats a physical effect.'),
    ('sl_cmp_delivery', 'sl_compaction', 'equal', 'Proved observations are delivered in legal predecessor order and a later group waits for the previous first receipt.'),
    ('sl_cmp_terminal', 'sl_compaction', 'equal', 'The terminal result is published only with a proved terminal phase, every attempt disposed, every observation issued and the required aftermath, freezes its first settlement once and replays it unchanged.'),
    ('sl_cmp_detail', 'sl_compaction', 'equal', 'Detail is eligible at first settlement + 604800 s inclusive only for a settled operation with no hold, live, backup, rollback, recovery or maintenance protection, with no reset by reads or retries.'),
    ('sl_cmp_members', 'sl_compaction', 'equal', 'Retirement targets exactly the eligible detail members and never CURRENT, manifests, active, pending, source, carrier, target or core segments, receipts, dedupe, terminal map or owner values.'),
    ('sl_cmp_retirement', 'sl_compaction', 'equal', 'The retirement intent with its HMP id precedes every unlink, each unlink is rechecked, the compact receipt is filled before the intent clears and a crash keeps the intent.'),
    ('sl_cmp_backup', 'sl_compaction', 'equal', 'Restore keeps the original settlement and retirement times and receipts, active-detail removal leaves backup copies, and old pending identity never first-mints.'),
    ('sl_cmp_role', 'sl_compaction_source', 'equal', 'Only the installed native compaction role with its installation receipt may admit multi-segment compaction or parse the new CURRENT/manifest; a copied role record or adapter string grants nothing.'),
    ('sl_cmp_effect_plan', 'sl_compaction_source', 'equal', 'Every physical effect is preceded by its durable original plan under the HMP effect id, and a published artifact is never rewritten.'),
    ('sl_cmp_groups', 'sl_compaction_source', 'equal', 'Maintenance waits until every existing protected group has issued its first receipts; each lifecycle observation is a one-event barrier group.'),
    ('sl_cmp_bytes', 'sl_compaction_source', 'equal', 'Every selected segment is scanned once from byte zero to its durable end, frame generations match their member, identities are unique and closed gaps cover every missing sequence.'),
    ('sl_cmp_translation', 'sl_compaction_source', 'equal', 'Before the carrier seal the source index catches up through the commit_pending receipt; the translation source is the frozen inputs plus the whole carrier; original receipt coordinates never change and removed events keep no current row.'),
    ('sl_cmp_continuation', 'sl_compaction_source', 'equal', 'After target CURRENT only the same original maintenance owner with a proved committed edge and its durable obligation may finish; other writes, maintenance, publication and success stay fenced.'),
    ('sl_cmp_source_successor', 'sl_compaction_source', 'equal', 'A source successor after a sealed carrier needs proven never-published source and the installed adapter; the carrier is never reopened and source is never chosen after target visibility.'),
    ('sl_cmp_final_fence', 'sl_compaction_source', 'equal', 'Each publisher derives its afterimage before helpers and runs its final pure check after them with nothing in between; a late refusal preserves genuine earlier effects.'),
    ('sl_cmp_journal', 'sl_compaction_source', 'equal', 'A journal is removable only when every member is settled and none is needed; a mutable journal holding a needed member is never unlinked whole.'),
    ('sl_cmp_numbers', 'sl_compaction', 'error', 'Detail member lengths use shared storage_uint64.'),
    ('sl_cmp_time', 'sl_compaction', 'error', 'Proof capture times and their event occurrence copies use the EventRecord date-time profile.'),
]


# ---------------------------------------------------------------- owner rules

def operation_digest(nonce):
    return s.hmp(['pm.storage.compaction.identity.v1', '1.0.0', w.STORE, nonce])


def compaction_id(nonce):
    return 'pm.storage.compaction.v1:' + operation_digest(nonce)


def transition_digest(cid, ordinal, predecessor, frm, to):
    return s.hmp(['pm.storage.compaction.transition.v1', '1.0.0', cid, ordinal, predecessor, frm, to])


def artifact_ref(cid, kind, ordinal):
    return 'pm.storage.compaction.artifact.v1:' + s.hmp(['pm.storage.compaction.artifact.v1', '1.0.0', cid, kind, ordinal])


def retirement_id(cid, settlement_tx, catalog):
    return 'pm.storage.compaction.detail_retirement.v1:' + s.hmp(['pm.storage.compaction.detail_retirement.v1', '1.0.0', w.STORE, cid, settlement_tx, catalog])


def provable(frm, to, f):
    """SP-296/G18/G20 phase postconditions over independently held native-state facts."""
    cur = f.get('current'); act = f.get('activation')
    if to == 'preparing':
        return frm is None and f.get('header_frozen') is True and f.get('lease') is True
    if to == 'building':
        return f.get('build_admitted') is True and cur == 'source'
    if to == 'verified':
        return f.get('target_verified') is True and cur == 'source'
    if to == 'commit_pending':
        return f.get('pending_durable') is True and cur == 'source'
    if to == 'committed':
        return cur == 'target' and act == 'complete' and f.get('target_verified') is True and f.get('aftermath_applied') is True
    if to == 'finalized':
        return frm == 'committed' and cur == 'target' and act == 'complete' and f.get('finalization') == 'complete' \
            and f.get('next_active') is True and f.get('pending_cleared') is True
    if to == 'failed':
        return cur == 'source' and act == 'none' and not f.get('target_visible') and bool(f.get('failure_reason'))
    if to == 'recovery_required':
        ambiguous = cur == 'unknown' or (frm == 'commit_pending' and cur == 'target' and act != 'complete') \
            or (frm == 'committed' and f.get('finalization') != 'complete') or f.get('controls_conflict') is True
        return ambiguous and bool(f.get('failure_reason'))
    return False


def exceptional(frm, f):
    """The actual exceptional successor of an unprovable reservation, from the last proved phase."""
    for to in ('failed', 'recovery_required'):
        if to in ADJ.get(frm, ()) and provable(frm, to, f):
            return to
    return None


def select_actions(f):
    checkpoint = 'translate_by_semantic_identity' if (f['survivor_digest_match'] and f['positions_resolved']
                                                     and not f['timestamp_or_physical_derived']) else 'invalidate_and_rebuild'
    projection = 'activate_verified_target_shadow' if (f['target_shadow_complete'] and f['shadow_verified']) else 'rebuild_from_survivors'
    return checkpoint, projection


def walk(op, runs):
    """Owner expectation for every edge run: ordinals, proved edges, dispositions and their events."""
    state = {'last': None, 'last_tid': None, 'next': 0}
    out = {}
    for i, r in enumerate(runs):
        if r['kind'] != 'edge':
            continue
        frm = state['last']; to = r['to']; f = r['facts']
        if frm in TERMINAL or to not in (ADJ.get(frm, ()) if frm is not None else ('preparing',)):
            out[i] = {'legal': False}
            continue
        n = state['next']
        if provable(frm, to, f):
            tid = transition_digest(op['compaction_id'], n, state['last_tid'], frm, to)
            out[i] = {'legal': True, 'proved': (to, n, tid), 'closed': None, 'successor': None}
            state.update(last=to, last_tid='pm.storage.compaction.transition.v1:' + tid, next=n + 1)
            continue
        succ = exceptional(frm, f)
        rec = {'legal': True, 'proved': None, 'closed': n, 'successor': None}
        if succ:
            tid = transition_digest(op['compaction_id'], n + 1, state['last_tid'], frm, succ)
            rec['successor'] = (succ, n + 1, tid)
            state.update(last=succ, last_tid='pm.storage.compaction.transition.v1:' + tid, next=n + 2)
        else:
            state['next'] = n + 1
        out[i] = rec
    return out


def frozen_event(op, base, phase, tid, f):
    p = {'schema_version': '1.0.0', 'compaction_id': op['compaction_id'], 'source_generation_refs': list(op['source_generation_refs']),
         'target_generation_ref': op['target_generation_ref'], 'phase': phase, 'policy_revision': op['policy_revision'],
         'policy_hash': op['policy_hash'], 'survivor_ref': artifact_ref(op['compaction_id'], 'survivor', 0),
         'removal_map_ref': artifact_ref(op['compaction_id'], 'removal', 0), 'checkpoint_action': op['checkpoint_action'],
         'projection_action': op['projection_action']}
    if phase in EXCEPTIONAL:
        p['failure_reason'] = f['failure_reason']
    correlation = op['manual_correlation'] if op['initiator'] == 'manual' else 'storage.compaction:' + operation_digest(op['nonce'])
    return s.event(base, p, 'evt_storage_compaction_' + tid, CMP + ':' + tid, scope_kind='application', project_id=None, thread_id=None,
                   run_id=None, node_id=None, attempt_id=None, actor_ref=op['actor_ref'], correlation_id=correlation,
                   occurred_at_utc=f['captured_at_utc'], causation_event_id=None, parent_event_id=None, producer_sequence_id=None,
                   payload_ref=None, redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key')


def aftermath(phase):
    return {'success_claim': phase == 'finalized', 'target_activation': phase in ('committed', 'finalized'),
            'checkpoint_advance': phase in ('committed', 'finalized'), 'source_deletion': False,
            'fenced': phase == 'recovery_required'}


def effect_id(cid, attempt, ordinal, kind):
    return 'pm.storage.compaction.effect.v1:' + s.hmp(['pm.storage.compaction.effect.v1', '1.0.0', cid, attempt, ordinal, kind])


ROLE = 'storage.compaction.native_source.v1'


def scan_ok(f):
    seen = set(); sequences = []
    for seg in f['segments']:
        for frame in seg['frames']:
            if frame['generation'] != seg['generation'] or frame['event_id'] in seen:
                return False
            seen.add(frame['event_id']); sequences.append(frame['sequence_id'])
    if len(set(sequences)) != len(sequences):
        return False
    covered = set(sequences)
    for gap in f['gaps']:
        covered |= set(range(gap['first'], gap['last'] + 1))
    return bool(sequences) and covered == set(range(min(covered), max(covered) + 1))


def detail_eligible(f):
    if f['unresolved'] or f['protections']:
        return False
    return (s.utc(f['cutoff_utc']) - s.utc(f['first_settled_at_utc'])).total_seconds() >= TTL


# ---------------------------------------------------------------- operands

def operands(case, put, common):
    runs = s.runs_of(case, CMP)
    if runs is None:
        put('sl_cmp_admission', ['boundary record missing'], [])
        return
    op = case['sl']['op']; base = case['sl']['base_event']
    numbers = []
    for i, r in enumerate(runs):
        for j, m in enumerate(r['facts'].get('members') or []):
            error = w.caught(w.storage_uint64, m.get('length'))
            if error:
                numbers.append(('run%d/member%d' % (i, j), error))
    times = s.date_errors([('run%d/captured' % i, r['facts'].get('captured_at_utc'), w.EVENT_RECORD) for i, r in enumerate(runs) if r['kind'] == 'edge']
                          + [('run%d/event%d' % (i, j), e.get('occurred_at_utc'), w.EVENT_RECORD) for i, r in enumerate(runs) if r['kind'] == 'edge'
                             for j, e in enumerate(r.get('events_appended') or [])])
    put('sl_cmp_numbers', numbers); put('sl_cmp_time', times)
    ok = not numbers and not times
    if not ok:
        return  # every other row of this family is inapplicable until the shared number/time rows pass
    rows = {k: ([], []) for k in ('admission', 'graph', 'phase', 'disposition', 'identity', 'event', 'actions', 'aftermath', 'publication',
                                  'authority', 'core', 'restart', 'delivery', 'terminal', 'detail', 'members', 'retirement', 'backup',
                                  'role', 'effect_plan', 'groups', 'bytes', 'translation', 'continuation', 'source_successor', 'final_fence', 'journal')}
    def add(row, i, left, right):
        rows[row][0].append((i,) + tuple(left)); rows[row][1].append((i,) + tuple(right))
    plan = walk(op, runs) if ok else {}
    for i, r in enumerate(runs):
        k = r['kind']; f = r['facts']
        if k == 'admit':
            cmd = f['command']; same = [x for x in f['existing'] if x['identity'] == cmd['identity']]
            if not f['lookup_available']:
                want = ('unavailable', None, None)
            elif same:
                want = ('rejoined', same[0]['compaction_id'], None) if same[0]['digest'] == cmd['digest'] else ('idempotency_conflict', None, None)
            elif not (f['lease'] and f['lock']):
                want = ('refused', None, None)
            else:
                want = ('admitted', compaction_id(f['nonce']), f['source_generation'] + 1)
            header = r.get('header') or {}
            add('admission', i, (r.get('decision'), r.get('compaction_id'), header.get('target_generation'),
                                 [x for x in header.get('frozen_inputs', []) if x in f.get('carrier', [])]),
                (want[0], want[1], want[2], []))
        elif k == 'edge' and ok:
            e = plan[i]
            add('graph', i, (r.get('reserved'),), ((e['legal'] and [r.get('from'), r['to']]) or None,))
            if not e['legal']:
                add('phase', i, (r.get('proved'), r.get('closed'), len(r.get('events_appended') or [])), (None, None, 0))
                continue
            add('phase', i, ((r.get('proved') or [None])[0],), ((e['proved'] or [None])[0],))
            add('disposition', i, (r.get('closed'), (r.get('successor') or [None, None])[:2], (r.get('proved') or [None, None])[1]),
                (e['closed'], list(e['successor'][:2]) if e['successor'] else [None, None], e['proved'][1] if e['proved'] else None))
            proved = e['proved'] or e['successor']
            events = r.get('events_appended') or []
            if proved:
                phase, _n, tid = proved
                want = frozen_event(op, base, phase, tid, f)
                add('identity', i, ([(x.get('event_id'), x.get('idempotency_key')) for x in events],), ([(want['event_id'], want['idempotency_key'])] * len(events),))
                add('event', i, (len(events), [s.cj({k_: v for k_, v in x.items() if k_ not in ('event_id', 'idempotency_key', 'sequence_id', 'observed_at_utc', 'persisted_at_utc')}) for x in events]),
                    (1, [s.cj({k_: v for k_, v in want.items() if k_ not in ('event_id', 'idempotency_key', 'sequence_id', 'observed_at_utc', 'persisted_at_utc')})]))
                add('aftermath', i, (r.get('aftermath'),), (aftermath(phase),))
            else:
                add('event', i, (len(events),), (0,))
        elif k == 'actions':
            add('actions', i, (r.get('checkpoint_action'), r.get('projection_action')), select_actions(f))
        elif k == 'publish':
            add('publication', i, (r.get('trace'),), (PUBLICATION,))
        elif k == 'read':
            entry = f['current_entry_kind']
            want = {'status': 'unavailable'} if entry != 'selected' else \
                {'status': 'available', 'selected': f['current'], 'last_proven': f['last_proven'], 'delivered': f['delivered']}
            add('authority', i, (r.get('result'), r.get('effects')), (want, []))
        elif k == 'core':
            expected = {}
            for x in f['inputs']:
                if x['event_id'] in f['carrier']:
                    continue
                expected[x['event_id']] = 'removed' if x['policy_evidence'] and not x['current_row'] else 'survivor'
            survivors = sorted(x['event_id'] for x in f['inputs'] if expected.get(x['event_id']) == 'survivor')
            add('core', i, (r.get('outcomes'), r.get('survivor_bytes_equal')), (expected, survivors))
        elif k == 'restart':
            last = f['last_proven']
            if last in TERMINAL:
                want = ('return_original_result', f['terminal_result'], [])
            elif last == 'recovery_required':
                want = ('stay_fenced', None, [])
            elif f['next_postcondition_proven']:
                want = ('resume_next_edge', f['next_phase'], [] if f['physical_already_complete'] else f['remaining_effects'])
            else:
                want = ('enter_recovery_required', None, [])
            add('restart', i, (r.get('decision'), r.get('target'), r.get('repeated_effects'), r.get('compaction_id')),
                (want[0], want[1], want[2], op['compaction_id']))
        elif k == 'delivery':
            order = sorted(f['proved'], key=lambda x: x['ordinal'])
            add('delivery', i, (r.get('order'), r.get('waits_for_previous_receipt')), ([x['transition_id'] for x in order], True))
        elif k == 'terminal':
            ready = f['terminal_phase'] in TERMINAL and f['attempts_disposed'] and f['observations_issued'] \
                and (f['terminal_phase'] == 'failed' or f['aftermath_applied']) and f['result_obligations_ready']
            if f['existing'] is not None:
                want = ('replayed', f['existing']['first_fully_settled_at_utc']) if f['existing']['digest'] == f['digest'] else ('idempotency_conflict', None)
            else:
                want = ('published', f['settled_at_utc']) if ready else ('unavailable', None)
            add('terminal', i, (r.get('decision'), r.get('first_fully_settled_at_utc'), r.get('lifecycle_edges')), (want[0], want[1], []))
        elif k == 'detail' and ok:
            add('detail', i, (r.get('eligible'),), (detail_eligible(f),))
            if detail_eligible(f):
                want = sorted(m['ref'] for m in f['members'] if m['kind'] in ELIGIBLE_KINDS and not m.get('needed_by_reader'))
                add('members', i, (sorted(r.get('targets') or []),), (want,))
        elif k == 'retire':
            rid = retirement_id(op['compaction_id'], f['settlement_tx'], f['catalog_sha256'])
            steps = RETIREMENT + [x for ref in f['targets'] for x in ('recheck:' + ref, 'unlink:' + ref, 'sync_parent:' + ref)]
            if f.get('crash_after_unlinks'):
                want = (steps + ['crash'], 'kept', None)
            else:
                want = (steps + ['fill_detail_retirement_receipt', 'readback_absence', 'clear_retirement_intent'], 'cleared',
                        {'member_count': len(f['targets']), 'retirement_id': rid})
            add('retirement', i, (r.get('retirement_id'), r.get('trace'), r.get('intent'), r.get('receipt')), (rid,) + want)
        elif k == 'restore':
            add('backup', i, (r.get('first_fully_settled_at_utc'), r.get('retired_at_utc'), r.get('backup_copies'), r.get('pending_first_mint')),
                (f['original_settled_at_utc'], f['original_retired_at_utc'], f['backup_copies'], False))
        elif k == 'role':
            good = f['role'] == ROLE and f['installation_receipt'] and f['role_record'] == 'installed' if f['multi_segment'] else \
                f['role'] in (ROLE, 'storage.seglog.single_segment.v1') and f['installation_receipt'] and f['role_record'] == 'installed'
            add('role', i, (r.get('decision'),), ('admitted' if good else 'refused',))
        elif k == 'effects':
            want = [[step, effect_id(op['compaction_id'], f['attempt_ordinal'], n, kind)] for n, kind in enumerate(f['effect_kinds']) for step in ('plan', 'effect')]
            add('effect_plan', i, (r.get('journal'), r.get('artifact_rewrites')), (want, []))
        elif k == 'groups':
            ready = all(g_['issued'] for g_ in f['existing_groups'])
            add('groups', i, (r.get('decision'), r.get('lifecycle_group')), ('proceed' if ready else 'fenced', {'events': 1, 'durability_class': 'barrier'}))
        elif k == 'scan':
            add('bytes', i, (r.get('decision'), r.get('scanned')),
                ('verified' if scan_ok(f) else 'fenced', [[seg['name'], 0, seg['durable_end']] for seg in f['segments']]))
        elif k == 'translate':
            add('translation', i, (r.get('catchup_through'), r.get('catchup_before_seal'), r.get('source_set'), r.get('receipt_coordinate_changes'),
                                   r.get('removed_current_rows')),
                (f['commit_pending_receipt'], True, sorted(f['frozen_inputs'] + f['carrier']), [], []))
        elif k == 'continuation':
            allowed = f['requester'] == f['original_owner'] and f['committed_proved'] and f['durable_obligation'] and f['request'] == 'finalization'
            add('continuation', i, (r.get('decision'),), ('allowed' if allowed else 'fenced',))
        elif k == 'source_successor':
            ok_ = f['never_published_proven'] and f['adapter_installed'] and not f['target_visible']
            add('source_successor', i, (r.get('decision'), r.get('carrier_reopened'), r.get('selected')),
                ('create_successor' if ok_ else 'pending_unavailable', False, 'target' if f['target_visible'] else 'source'))
        elif k == 'publisher':
            tail_ = ['refuse'] if f['state_changed_after_helpers'] else ['publish']
            add('final_fence', i, (r.get('trace'), r.get('rolled_back')), (['derive_afterimage', 'run_helpers', 'final_pure_check'] + tail_, []))
        elif k == 'journal':
            removable = not any(m['needed'] or not m['settled'] for m in f['journal_members'])
            add('journal', i, (r.get('removable'),), (removable,))
    for name, (left, right) in rows.items():
        put('sl_cmp_' + name, left, right, ok)


# ---------------------------------------------------------------- fixture constructor

NONCE = 'd' * 64


def op_of(case, initiator='automatic'):
    cid = compaction_id(NONCE)
    checkpoint, projection = select_actions(action_facts())
    return {'nonce': NONCE, 'compaction_id': cid, 'source_generation_refs': ['generation:3'], 'target_generation_ref': 'generation:4',
            'policy_revision': 'rev-7', 'policy_hash': 'e' * 64, 'checkpoint_action': checkpoint, 'projection_action': projection,
            'initiator': initiator, 'manual_correlation': 'command:compaction-1', 'actor_ref': 'storage.principal' if initiator == 'automatic' else 'actor-A'}


def action_facts(**change):
    value = {'survivor_digest_match': True, 'positions_resolved': True, 'timestamp_or_physical_derived': False,
             'target_shadow_complete': True, 'shadow_verified': True}
    value.update(change)
    return value


def native(**change):
    value = {'header_frozen': True, 'lease': True, 'build_admitted': True, 'target_verified': True, 'pending_durable': True,
             'current': 'source', 'activation': 'none', 'aftermath_applied': True, 'finalization': 'incomplete', 'next_active': False,
             'pending_cleared': False, 'target_visible': False, 'failure_reason': None, 'controls_conflict': False,
             'captured_at_utc': '2026-11-14T12:00:00Z'}
    value.update(change)
    return value


ORDINARY = [('preparing', native()), ('building', native()), ('verified', native()), ('commit_pending', native()),
            ('committed', native(current='target', activation='complete', target_visible=True)),
            ('finalized', native(current='target', activation='complete', finalization='complete', next_active=True, pending_cleared=True,
                                 target_visible=True))]


def simulate(case, run, state):
    """Owner-conforming presented outcome of one run (fixture constructor, never called by the checker)."""
    op = case['sl']['op']; base = case['sl']['base_event']; k = run['kind']; f = run['facts']
    run.setdefault('events_appended', [])
    if k == 'admit':
        cmd = f['command']; same = [x for x in f['existing'] if x['identity'] == cmd['identity']]
        if not f['lookup_available']:
            run.update(decision='unavailable', compaction_id=None)
        elif same:
            run.update(decision='rejoined' if same[0]['digest'] == cmd['digest'] else 'idempotency_conflict',
                       compaction_id=same[0]['compaction_id'] if same[0]['digest'] == cmd['digest'] else None)
        elif not (f['lease'] and f['lock']):
            run.update(decision='refused', compaction_id=None)
        else:
            run.update(decision='admitted', compaction_id=compaction_id(f['nonce']),
                       header={'target_generation': f['source_generation'] + 1, 'frozen_inputs': [x for x in f['inputs'] if x not in f['carrier']]})
        return state
    if k == 'edge':
        frm = state['last']; to = run['to']; run['from'] = frm
        if frm in TERMINAL or to not in (ADJ.get(frm, ()) if frm is not None else ('preparing',)):
            run.update(reserved=None, proved=None, closed=None, successor=None)
            return state
        n = state['next']; run['reserved'] = [frm, to]
        if provable(frm, to, f):
            tid = transition_digest(op['compaction_id'], n, state['last_tid'], frm, to)
            run.update(proved=[to, n, tid], closed=None, successor=None, events_appended=[frozen_event(op, base, to, tid, f)], aftermath=aftermath(to))
            return dict(state, last=to, last_tid='pm.storage.compaction.transition.v1:' + tid, next=n + 1)
        succ = exceptional(frm, f)
        run.update(proved=None, closed=n, successor=None)
        if succ:
            tid = transition_digest(op['compaction_id'], n + 1, state['last_tid'], frm, succ)
            run.update(successor=[succ, n + 1, tid], events_appended=[frozen_event(op, base, succ, tid, f)], aftermath=aftermath(succ))
            return dict(state, last=succ, last_tid='pm.storage.compaction.transition.v1:' + tid, next=n + 2)
        return dict(state, next=n + 1)
    if k == 'actions':
        run['checkpoint_action'], run['projection_action'] = select_actions(f)
        return state
    if k == 'publish':
        run['trace'] = list(PUBLICATION)
        return state
    if k == 'read':
        run.update(effects=[], result={'status': 'unavailable'} if f['current_entry_kind'] != 'selected' else
                   {'status': 'available', 'selected': f['current'], 'last_proven': f['last_proven'], 'delivered': f['delivered']})
        return state
    if k == 'core':
        out = {x['event_id']: 'removed' if x['policy_evidence'] and not x['current_row'] else 'survivor' for x in f['inputs'] if x['event_id'] not in f['carrier']}
        run.update(outcomes=out, survivor_bytes_equal=sorted(e for e, v in out.items() if v == 'survivor'))
        return state
    if k == 'restart':
        last = f['last_proven']
        if last in TERMINAL:
            run.update(decision='return_original_result', target=f['terminal_result'], repeated_effects=[])
        elif last == 'recovery_required':
            run.update(decision='stay_fenced', target=None, repeated_effects=[])
        elif f['next_postcondition_proven']:
            run.update(decision='resume_next_edge', target=f['next_phase'], repeated_effects=[] if f['physical_already_complete'] else list(f['remaining_effects']))
        else:
            run.update(decision='enter_recovery_required', target=None, repeated_effects=[])
        run['compaction_id'] = op['compaction_id']
        return state
    if k == 'delivery':
        run.update(order=[x['transition_id'] for x in sorted(f['proved'], key=lambda x: x['ordinal'])], waits_for_previous_receipt=True)
        return state
    if k == 'terminal':
        ready = f['terminal_phase'] in TERMINAL and f['attempts_disposed'] and f['observations_issued'] \
            and (f['terminal_phase'] == 'failed' or f['aftermath_applied']) and f['result_obligations_ready']
        if f['existing'] is not None:
            same = f['existing']['digest'] == f['digest']
            run.update(decision='replayed' if same else 'idempotency_conflict', first_fully_settled_at_utc=f['existing']['first_fully_settled_at_utc'] if same else None)
        else:
            run.update(decision='published' if ready else 'unavailable', first_fully_settled_at_utc=f['settled_at_utc'] if ready else None)
        run['lifecycle_edges'] = []
        return state
    if k == 'detail':
        run['eligible'] = detail_eligible(f)
        run['targets'] = sorted(m['ref'] for m in f['members'] if m['kind'] in ELIGIBLE_KINDS and not m.get('needed_by_reader')) if run['eligible'] else []
        return state
    if k == 'retire':
        rid = retirement_id(op['compaction_id'], f['settlement_tx'], f['catalog_sha256'])
        steps = RETIREMENT + [x for ref in f['targets'] for x in ('recheck:' + ref, 'unlink:' + ref, 'sync_parent:' + ref)]
        if f.get('crash_after_unlinks'):
            run.update(retirement_id=rid, trace=steps + ['crash'], intent='kept', receipt=None)
        else:
            run.update(retirement_id=rid, trace=steps + ['fill_detail_retirement_receipt', 'readback_absence', 'clear_retirement_intent'],
                       intent='cleared', receipt={'member_count': len(f['targets']), 'retirement_id': rid})
        return state
    if k == 'restore':
        run.update(first_fully_settled_at_utc=f['original_settled_at_utc'], retired_at_utc=f['original_retired_at_utc'],
                   backup_copies=copy.deepcopy(f['backup_copies']), pending_first_mint=False)
        return state
    if k == 'role':
        good = f['role'] == ROLE and f['installation_receipt'] and f['role_record'] == 'installed' if f['multi_segment'] else \
            f['role'] in (ROLE, 'storage.seglog.single_segment.v1') and f['installation_receipt'] and f['role_record'] == 'installed'
        run['decision'] = 'admitted' if good else 'refused'
        return state
    if k == 'effects':
        run.update(journal=[[step, effect_id(op['compaction_id'], f['attempt_ordinal'], n, kind)] for n, kind in enumerate(f['effect_kinds'])
                            for step in ('plan', 'effect')], artifact_rewrites=[])
        return state
    if k == 'groups':
        run.update(decision='proceed' if all(g_['issued'] for g_ in f['existing_groups']) else 'fenced',
                   lifecycle_group={'events': 1, 'durability_class': 'barrier'})
        return state
    if k == 'scan':
        run.update(decision='verified' if scan_ok(f) else 'fenced', scanned=[[seg['name'], 0, seg['durable_end']] for seg in f['segments']])
        return state
    if k == 'translate':
        run.update(catchup_through=f['commit_pending_receipt'], catchup_before_seal=True, source_set=sorted(f['frozen_inputs'] + f['carrier']),
                   receipt_coordinate_changes=[], removed_current_rows=[])
        return state
    if k == 'continuation':
        allowed = f['requester'] == f['original_owner'] and f['committed_proved'] and f['durable_obligation'] and f['request'] == 'finalization'
        run['decision'] = 'allowed' if allowed else 'fenced'
        return state
    if k == 'source_successor':
        ok_ = f['never_published_proven'] and f['adapter_installed'] and not f['target_visible']
        run.update(decision='create_successor' if ok_ else 'pending_unavailable', carrier_reopened=False,
                   selected='target' if f['target_visible'] else 'source')
        return state
    if k == 'publisher':
        run.update(trace=['derive_afterimage', 'run_helpers', 'final_pure_check'] + (['refuse'] if f['state_changed_after_helpers'] else ['publish']),
                   rolled_back=[])
        return state
    if k == 'journal':
        run['removable'] = not any(m['needed'] or not m['settled'] for m in f['journal_members'])
        return state
    raise ValueError(k)


def scenario(case, specs, initiator='automatic'):
    stored = case['stored_event']
    case['sl'] = {'family': CMP, 'op': op_of(case, initiator), 'base_event': copy.deepcopy(stored), 'runs': []}
    state = {'last': None, 'last_tid': None, 'next': 0}
    for spec in specs:
        run = copy.deepcopy(spec); run.setdefault('facts', {})
        case['sl']['runs'].append(run)
        state = simulate(case, run, state)
    return case


def E(to, facts):
    return {'kind': 'edge', 'to': to, 'facts': copy.deepcopy(facts)}


def members():
    return [{'kind': kind, 'ref': 'detail:' + kind, 'length': 64} for kind in ELIGIBLE_KINDS] + \
           [{'kind': kind, 'ref': 'forbidden:' + kind, 'length': 64} for kind in FORBIDDEN_KINDS] + \
           [{'kind': 'translation_detail', 'ref': 'detail:needed-translation', 'length': 64, 'needed_by_reader': True}]


def source_specs():
    seg = lambda name, gen, frames, end: {'name': name, 'generation': gen, 'durable_end': end,
                                          'frames': [{'event_id': x[0], 'sequence_id': x[1], 'generation': x[2] if len(x) > 2 else gen} for x in frames]}
    owner = 'MaintenanceOwner:original-1'
    role = lambda **ch: {'kind': 'role', 'facts': dict({'role': ROLE, 'installation_receipt': True, 'role_record': 'installed', 'multi_segment': True}, **ch)}
    cont = lambda **ch: {'kind': 'continuation', 'facts': dict({'requester': owner, 'original_owner': owner, 'committed_proved': True,
                                                                'durable_obligation': True, 'request': 'finalization'}, **ch)}
    succ = lambda **ch: {'kind': 'source_successor', 'facts': dict({'never_published_proven': True, 'adapter_installed': True, 'target_visible': False}, **ch)}
    return [dict(role(), label='role'), dict(role(role_record='copied'), label='role-copied'),
            dict(role(role='storage.seglog.single_segment.v1'), label='role-old-multi'),
            dict(role(role='storage.seglog.single_segment.v1', multi_segment=False), label='role-old-single'),
            dict(role(installation_receipt=False), label='role-uninstalled'),
            {'label': 'effects', 'kind': 'effects', 'facts': {'attempt_ordinal': 4, 'effect_kinds': ['write_initial_pending', 'replace_current', 'activate_target_atomic']}},
            {'label': 'groups', 'kind': 'groups', 'facts': {'existing_groups': [{'id': 'group-1', 'issued': True}, {'id': 'group-2', 'issued': True}]}},
            {'label': 'groups-unissued', 'kind': 'groups', 'facts': {'existing_groups': [{'id': 'group-1', 'issued': True}, {'id': 'group-2', 'issued': False}]}},
            {'label': 'scan', 'kind': 'scan', 'facts': {'segments': [seg('seg-3a', 3, [('e1', 1), ('e2', 2)], 512), seg('seg-3b', 3, [('e5', 5)], 256)],
                                                        'gaps': [{'first': 3, 'last': 4, 'reason': 'retention_compaction'}]}},
            {'label': 'scan-generation', 'kind': 'scan', 'facts': {'segments': [seg('seg-3a', 3, [('e1', 1), ('e2', 2)], 512), seg('seg-3b', 3, [('e3', 3, 4)], 256)], 'gaps': []}},
            {'label': 'scan-hole', 'kind': 'scan', 'facts': {'segments': [seg('seg-3a', 3, [('e1', 1), ('e2', 2)], 512), seg('seg-3b', 3, [('e5', 5)], 256)], 'gaps': []}},
            {'label': 'scan-duplicate', 'kind': 'scan', 'facts': {'segments': [seg('seg-3a', 3, [('e1', 1), ('e2', 2)], 512), seg('seg-3b', 3, [('e2', 3)], 256)], 'gaps': []}},
            {'label': 'translate', 'kind': 'translate', 'facts': {'frozen_inputs': ['e1', 'e2'], 'carrier': ['e9'], 'commit_pending_receipt': 'receipt:commit_pending'}},
            dict(cont(), label='continuation'), dict(cont(requester='MaintenanceOwner:other'), label='continuation-other-owner'),
            dict(cont(request='ordinary_write'), label='continuation-ordinary-write'), dict(cont(committed_proved=False), label='continuation-unproved'),
            dict(succ(), label='successor'), dict(succ(target_visible=True), label='successor-after-target'),
            dict(succ(adapter_installed=False), label='successor-no-adapter'),
            {'label': 'publisher', 'kind': 'publisher', 'facts': {'state_changed_after_helpers': False}},
            {'label': 'publisher-changed', 'kind': 'publisher', 'facts': {'state_changed_after_helpers': True}},
            {'label': 'journal', 'kind': 'journal', 'facts': {'journal_members': [{'settled': True, 'needed': False}, {'settled': True, 'needed': False}]}},
            {'label': 'journal-needed', 'kind': 'journal', 'facts': {'journal_members': [{'settled': True, 'needed': False}, {'settled': True, 'needed': True}]}},
            {'label': 'journal-unsettled', 'kind': 'journal', 'facts': {'journal_members': [{'settled': False, 'needed': False}]}}]


def ordinary_specs():
    return [E(to, f) for to, f in ORDINARY]


def augment(control):
    scenario(control, ordinary_specs())


def label_index(value, label):
    return next(i for i, r in enumerate(value['sl']['runs']) if r.get('label') == label)


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    R = lambda i, *path: ('sl', 'runs', i) + path

    def build(label, specs, initiator='automatic'):
        value = w.build(CMP); scenario(value, specs, initiator)
        control = s.control(CMP, label, value); controls.append(control)
        return control, value

    cmd = {'identity': 'command:compaction-1', 'digest': 'f' * 64}
    adm = lambda **ch: {'kind': 'admit', 'facts': dict({'command': cmd, 'existing': [], 'lookup_available': True, 'lease': True, 'lock': True,
                                                         'nonce': NONCE, 'source_generation': 3, 'inputs': ['segment:1', 'segment:2', 'segment:active'],
                                                         'carrier': ['segment:active']}, **ch)}
    settled = {'first_fully_settled_at_utc': SETTLED_AT, 'digest': 'a' * 64}
    full = ([dict(adm(), label='admit'), dict(adm(existing=[dict(cmd, compaction_id='pm.storage.compaction.v1:' + '1' * 64)]), label='rejoin'),
             dict(adm(existing=[dict(cmd, digest='0' * 64, compaction_id='pm.storage.compaction.v1:' + '1' * 64)]), label='conflict'),
             dict(adm(lookup_available=False), label='lookup-unavailable'), dict(adm(lease=False), label='no-lease'),
             dict(adm(existing=[{'identity': 'command:old-failed', 'digest': 'b' * 64, 'compaction_id': 'pm.storage.compaction.v1:' + '2' * 64}],
                      nonce='c' * 64), label='retry-after-failed')]
            + [dict(E(to, f), label='edge-' + to) for to, f in ORDINARY]
            + [dict(E('committed', native(current='target', activation='complete')), label='after-finalized'),
               {'label': 'actions', 'kind': 'actions', 'facts': action_facts()},
               {'label': 'actions-derived', 'kind': 'actions', 'facts': action_facts(timestamp_or_physical_derived=True)},
               {'label': 'actions-unresolved', 'kind': 'actions', 'facts': action_facts(positions_resolved=False)},
               {'label': 'actions-digest', 'kind': 'actions', 'facts': action_facts(survivor_digest_match=False)},
               {'label': 'actions-shadow', 'kind': 'actions', 'facts': action_facts(shadow_verified=False)},
               {'label': 'publish', 'kind': 'publish', 'facts': {}},
               {'label': 'read', 'kind': 'read', 'facts': {'current_entry_kind': 'selected', 'current': 'target', 'newest_mtime': 'source',
                                                          'last_proven': 'finalized', 'delivered': 'committed', 'last_event_phase': 'committed'}},
               {'label': 'read-before-current', 'kind': 'read', 'facts': {'current_entry_kind': 'selected', 'current': 'source', 'newest_mtime': 'target',
                                                                         'last_proven': 'commit_pending', 'delivered': 'commit_pending', 'last_event_phase': 'committed'}},
               {'label': 'read-staged', 'kind': 'read', 'facts': {'current_entry_kind': 'staged_prefix', 'current': 'target', 'newest_mtime': 'target',
                                                                 'last_proven': 'commit_pending', 'delivered': 'commit_pending', 'last_event_phase': 'commit_pending'}},
               {'label': 'core', 'kind': 'core', 'facts': {'carrier': ['e-carrier'], 'inputs': [
                   {'event_id': 'e-1', 'policy_evidence': False, 'current_row': False}, {'event_id': 'e-2', 'policy_evidence': True, 'current_row': False},
                   {'event_id': 'e-3', 'policy_evidence': True, 'current_row': True}, {'event_id': 'e-carrier', 'policy_evidence': True, 'current_row': False}]}},
               {'label': 'delivery', 'kind': 'delivery', 'facts': {'proved': [{'transition_id': 't-2', 'ordinal': 2}, {'transition_id': 't-0', 'ordinal': 0},
                                                                             {'transition_id': 't-1', 'ordinal': 1}]}},
               {'label': 'terminal', 'kind': 'terminal', 'facts': {'terminal_phase': 'finalized', 'attempts_disposed': True, 'observations_issued': True,
                                                                  'aftermath_applied': True, 'result_obligations_ready': True, 'existing': None,
                                                                  'digest': 'a' * 64, 'settled_at_utc': SETTLED_AT}},
               {'label': 'terminal-unissued', 'kind': 'terminal', 'facts': {'terminal_phase': 'finalized', 'attempts_disposed': True, 'observations_issued': False,
                                                                           'aftermath_applied': True, 'result_obligations_ready': True, 'existing': None,
                                                                           'digest': 'a' * 64, 'settled_at_utc': SETTLED_AT}},
               {'label': 'terminal-replay', 'kind': 'terminal', 'facts': {'terminal_phase': 'finalized', 'attempts_disposed': True, 'observations_issued': True,
                                                                         'aftermath_applied': True, 'result_obligations_ready': True, 'existing': settled,
                                                                         'digest': 'a' * 64, 'settled_at_utc': '2026-11-02T00:00:00Z'}},
               {'label': 'terminal-conflict', 'kind': 'terminal', 'facts': {'terminal_phase': 'finalized', 'attempts_disposed': True, 'observations_issued': True,
                                                                           'aftermath_applied': True, 'result_obligations_ready': True, 'existing': settled,
                                                                           'digest': '9' * 64, 'settled_at_utc': '2026-11-02T00:00:00Z'}},
               {'label': 'terminal-failed', 'kind': 'terminal', 'facts': {'terminal_phase': 'failed', 'attempts_disposed': True, 'observations_issued': True,
                                                                         'aftermath_applied': False, 'result_obligations_ready': True, 'existing': None,
                                                                         'digest': 'a' * 64, 'settled_at_utc': SETTLED_AT}},
               {'label': 'detail', 'kind': 'detail', 'facts': {'first_settled_at_utc': SETTLED_AT, 'cutoff_utc': '2026-11-08T00:00:00Z', 'unresolved': False,
                                                              'protections': [], 'members': members()}},
               {'label': 'detail-early', 'kind': 'detail', 'facts': {'first_settled_at_utc': SETTLED_AT, 'cutoff_utc': '2026-11-07T23:59:59Z', 'unresolved': False,
                                                                    'protections': [], 'members': members()}},
               {'label': 'detail-held', 'kind': 'detail', 'facts': {'first_settled_at_utc': SETTLED_AT, 'cutoff_utc': '2026-12-08T00:00:00Z', 'unresolved': False,
                                                                   'protections': ['legal_hold:H1'], 'members': members()}},
               {'label': 'detail-unresolved', 'kind': 'detail', 'facts': {'first_settled_at_utc': SETTLED_AT, 'cutoff_utc': '2026-12-08T00:00:00Z', 'unresolved': True,
                                                                         'protections': [], 'members': members()}},
               {'label': 'retire', 'kind': 'retire', 'facts': {'settlement_tx': 'tx:settle-1', 'catalog_sha256': '7' * 64,
                                                              'targets': ['detail:survivor_detail', 'detail:resolved_journal']}},
               {'label': 'retire-crash', 'kind': 'retire', 'facts': {'settlement_tx': 'tx:settle-1', 'catalog_sha256': '7' * 64,
                                                                    'targets': ['detail:survivor_detail'], 'crash_after_unlinks': True}},
               {'label': 'restore', 'kind': 'restore', 'facts': {'original_settled_at_utc': SETTLED_AT, 'original_retired_at_utc': '2026-11-08T00:00:00Z',
                                                                'backup_copies': ['backup:B1/detail:survivor_detail']}},
               {'label': 'restart-terminal', 'kind': 'restart', 'facts': {'last_proven': 'finalized', 'terminal_result': 'result:original'}},
               {'label': 'restart-fenced', 'kind': 'restart', 'facts': {'last_proven': 'recovery_required'}},
               {'label': 'restart-resume', 'kind': 'restart', 'facts': {'last_proven': 'verified', 'next_postcondition_proven': True, 'next_phase': 'commit_pending',
                                                                       'physical_already_complete': False, 'remaining_effects': ['write_initial_pending']}},
               {'label': 'restart-finalized-physical', 'kind': 'restart', 'facts': {'last_proven': 'committed', 'next_postcondition_proven': True, 'next_phase': 'finalized',
                                                                                   'physical_already_complete': True, 'remaining_effects': ['finalize_namespace']}},
               {'label': 'restart-unproven', 'kind': 'restart', 'facts': {'last_proven': 'building', 'next_postcondition_proven': False}}]
            + source_specs())
    main, mv = build('lifecycle', full)
    runs = mv['sl']['runs']; A = lambda label: label_index(mv, label)
    ev = lambda label: runs[A(label)]['events_appended'][0]
    for row, path, replacement, label in [
            ('sl_cmp_admission', R(A('admit'), 'header', 'target_generation'), 5, 'target-not-source-plus-one'),
            ('sl_cmp_admission', R(A('admit'), 'header', 'frozen_inputs'), ['segment:1', 'segment:2', 'segment:active'], 'carrier-in-frozen-inputs'),
            ('sl_cmp_admission', R(A('admit'), 'compaction_id'), 'pm.storage.compaction.v1:' + s.hmp(['other']), 'id-not-from-nonce'),
            ('sl_cmp_admission', R(A('rejoin'), 'decision'), 'admitted', 'retry-mints-new-operation'),
            ('sl_cmp_admission', R(A('conflict'), 'decision'), 'rejoined', 'changed-digest-rejoins'),
            ('sl_cmp_admission', R(A('lookup-unavailable'), 'decision'), 'admitted', 'absent-index-as-new'),
            ('sl_cmp_admission', R(A('no-lease'), 'decision'), 'admitted', 'admitted-without-lease'),
            ('sl_cmp_admission', R(A('retry-after-failed'), 'compaction_id'), 'pm.storage.compaction.v1:' + '2' * 64, 'retry-reuses-failed-id'),
            ('sl_cmp_graph', R(A('after-finalized'), 'reserved'), ['finalized', 'committed'], 'edge-out-of-finalized'),
            ('sl_cmp_graph', R(A('edge-building'), 'reserved'), ['preparing', 'verified'], 'skipped-edge'),
            ('sl_cmp_phase', R(A('after-finalized'), 'events_appended'), [ev('edge-committed')], 'terminal-successor-appends'),
            ('sl_cmp_phase', R(A('edge-commit_pending'), 'proved', 0), 'committed', 'pending-proved-as-committed'),
            ('sl_cmp_disposition', R(A('edge-verified'), 'proved', 1), 3, 'ordinal-skips'),
            ('sl_cmp_identity', R(A('edge-verified'), 'events_appended', 0, 'event_id'), ev('edge-building')['event_id'], 'event-id-reused'),
            ('sl_cmp_identity', R(A('edge-finalized'), 'events_appended', 0, 'idempotency_key'), CMP + ':' + 'f' * 64, 'key-not-transition-digest'),
            ('sl_cmp_event', R(A('edge-finalized'), 'events_appended', 0, 'payload', 'failure_reason'), 'not required', 'reason-on-ordinary-phase'),
            ('sl_cmp_event', R(A('edge-committed'), 'events_appended', 0, 'correlation_id'), 'command:compaction-1', 'automatic-manual-correlation'),
            ('sl_cmp_event', R(A('edge-preparing'), 'events_appended', 0, 'payload', 'target_generation_ref'), 'generation:5', 'payload-other-target'),
            ('sl_cmp_event', R(A('edge-verified'), 'events_appended', 0, 'payload', 'checkpoint_action'), 'invalidate_and_rebuild', 'payload-other-mode'),
            ('sl_cmp_event', R(A('edge-committed'), 'events_appended', 0, 'project_id'), w.PROJECT, 'project-scoped-compaction'),
            ('sl_cmp_event', R(A('edge-building'), 'events_appended', 0, 'payload', 'survivor_ref'), artifact_ref(mv['sl']['op']['compaction_id'], 'survivor', 1), 'survivor-ref-other-ordinal'),
            ('sl_cmp_actions', R(A('actions-derived'), 'checkpoint_action'), 'translate_by_semantic_identity', 'timestamp-derived-translation'),
            ('sl_cmp_actions', R(A('actions-unresolved'), 'checkpoint_action'), 'translate_by_semantic_identity', 'unresolved-position-translation'),
            ('sl_cmp_actions', R(A('actions-digest'), 'checkpoint_action'), 'translate_by_semantic_identity', 'mismatched-survivor-translation'),
            ('sl_cmp_actions', R(A('actions-shadow'), 'projection_action'), 'activate_verified_target_shadow', 'unverified-shadow-activated'),
            ('sl_cmp_actions', R(A('actions'), 'projection_action'), 'rebuild_from_survivors', 'verified-shadow-rebuilt'),
            ('sl_cmp_aftermath', R(A('edge-committed'), 'aftermath', 'success_claim'), True, 'committed-claims-success'),
            ('sl_cmp_aftermath', R(A('edge-finalized'), 'aftermath', 'source_deletion'), True, 'finalize-deletes-source'),
            ('sl_cmp_aftermath', R(A('edge-commit_pending'), 'aftermath', 'checkpoint_advance'), True, 'checkpoint-before-current'),
            ('sl_cmp_publication', R(A('publish'), 'trace'), PUBLICATION[:4] + [PUBLICATION[6], PUBLICATION[4]] + PUBLICATION[5:6] + PUBLICATION[7:], 'activation-before-current'),
            ('sl_cmp_publication', R(A('publish'), 'trace'), PUBLICATION[:2] + [PUBLICATION[4], PUBLICATION[2], PUBLICATION[3]] + PUBLICATION[5:], 'current-before-manifest'),
            ('sl_cmp_publication', R(A('publish'), 'trace'), PUBLICATION[:6] + [PUBLICATION[7], PUBLICATION[6]] + PUBLICATION[8:], 'pointer-before-derived-index'),
            ('sl_cmp_authority', R(A('read-before-current'), 'result', 'selected'), 'target', 'mtime-selects-target'),
            ('sl_cmp_authority', R(A('read-staged'), 'result'), {'status': 'available', 'selected': 'target', 'last_proven': 'commit_pending', 'delivered': 'commit_pending'}, 'staged-prefix-selected'),
            ('sl_cmp_authority', R(A('read'), 'result', 'last_proven'), 'committed', 'history-merges-proven-and-delivered'),
            ('sl_cmp_authority', R(A('read'), 'effects'), ['checkpoint_advance'], 'read-advances-checkpoint'),
            ('sl_cmp_core', R(A('core'), 'outcomes', 'e-3'), 'removed', 'current-row-removed'),
            ('sl_cmp_core', R(A('core'), 'outcomes', 'e-1'), 'removed', 'removal-without-policy'),
            ('sl_cmp_core', R(A('core'), 'outcomes'), {'e-1': 'survivor', 'e-2': 'removed', 'e-3': 'survivor', 'e-carrier': 'removed'}, 'carrier-reclassified'),
            ('sl_cmp_core', R(A('core'), 'survivor_bytes_equal'), ['e-1'], 'survivor-bytes-changed'),
            ('sl_cmp_restart', R(A('restart-terminal'), 'decision'), 'resume_next_edge', 'terminal-restarts'),
            ('sl_cmp_restart', R(A('restart-fenced'), 'decision'), 'resume_next_edge', 'recovery-required-unfenced'),
            ('sl_cmp_restart', R(A('restart-finalized-physical'), 'repeated_effects'), ['finalize_namespace'], 'repeats-physical-finalization'),
            ('sl_cmp_restart', R(A('restart-unproven'), 'decision'), 'resume_next_edge', 'unproven-resume'),
            ('sl_cmp_restart', R(A('restart-resume'), 'compaction_id'), 'pm.storage.compaction.v1:' + '3' * 64, 'restart-new-identity'),
            ('sl_cmp_delivery', R(A('delivery'), 'order'), ['t-1', 't-0', 't-2'], 'out-of-order-delivery'),
            ('sl_cmp_delivery', R(A('delivery'), 'waits_for_previous_receipt'), False, 'group-advances-early'),
            ('sl_cmp_terminal', R(A('terminal-unissued'), 'decision'), 'published', 'terminal-before-observation'),
            ('sl_cmp_terminal', R(A('terminal-replay'), 'first_fully_settled_at_utc'), '2026-11-02T00:00:00Z', 'settlement-time-reset'),
            ('sl_cmp_terminal', R(A('terminal-conflict'), 'decision'), 'replayed', 'conflicting-terminal-replays'),
            ('sl_cmp_terminal', R(A('terminal'), 'lifecycle_edges'), ['finalized->settled'], 'settlement-creates-edge'),
            ('sl_cmp_detail', R(A('detail-early'), 'eligible'), True, 'detail-one-second-early'),
            ('sl_cmp_detail', R(A('detail'), 'eligible'), False, 'inclusive-boundary-refused'),
            ('sl_cmp_detail', R(A('detail-held'), 'eligible'), True, 'hold-overridden-by-age'),
            ('sl_cmp_detail', R(A('detail-unresolved'), 'eligible'), True, 'unresolved-aged-out'),
            ('sl_cmp_members', R(A('detail'), 'targets'), runs[A('detail')]['targets'] + ['forbidden:current'], 'current-retired'),
            ('sl_cmp_members', R(A('detail'), 'targets'), runs[A('detail')]['targets'] + ['forbidden:target_segment'], 'target-segment-retired'),
            ('sl_cmp_members', R(A('detail'), 'targets'), runs[A('detail')]['targets'] + ['detail:needed-translation'], 'needed-detail-retired'),
            ('sl_cmp_members', R(A('detail'), 'targets'), runs[A('detail')]['targets'][1:], 'eligible-member-omitted'),
            ('sl_cmp_retirement', R(A('retire'), 'retirement_id'), 'pm.storage.compaction.detail_retirement.v1:' + s.hmp(['cutoff-time']), 'retirement-id-from-cutoff'),
            ('sl_cmp_retirement', R(A('retire'), 'trace'), ['authenticate_terminal_and_catalogue', 'unlink:detail:survivor_detail', 'create_retirement_intent'] + runs[A('retire')]['trace'][3:], 'unlink-before-intent'),
            ('sl_cmp_retirement', R(A('retire'), 'trace'), [x for x in runs[A('retire')]['trace'] if not x.startswith('recheck:detail:resolved')], 'unlink-without-recheck'),
            ('sl_cmp_retirement', R(A('retire-crash'), 'intent'), 'cleared', 'crash-clears-intent'),
            ('sl_cmp_retirement', R(A('retire'), 'trace'), runs[A('retire')]['trace'][:-3] + ['clear_retirement_intent', 'fill_detail_retirement_receipt', 'readback_absence'], 'intent-cleared-before-receipt'),
            ('sl_cmp_backup', R(A('restore'), 'first_fully_settled_at_utc'), '2026-11-14T00:00:00Z', 'restore-resets-clock'),
            ('sl_cmp_backup', R(A('restore'), 'backup_copies'), [], 'detail-removal-deletes-backup'),
            ('sl_cmp_backup', R(A('restore'), 'pending_first_mint'), True, 'old-pending-first-mints')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    journal = runs[A('effects')]['journal']
    for row, path, replacement, label in [
            ('sl_cmp_role', R(A('role-copied'), 'decision'), 'admitted', 'copied-role-record-admits'),
            ('sl_cmp_role', R(A('role-old-multi'), 'decision'), 'admitted', 'old-role-multi-segment'),
            ('sl_cmp_role', R(A('role-uninstalled'), 'decision'), 'admitted', 'uninstalled-role-admits'),
            ('sl_cmp_role', R(A('role-old-single'), 'decision'), 'refused', 'old-single-segment-role-refused'),
            ('sl_cmp_effect_plan', R(A('effects'), 'journal'), [journal[1], journal[0]] + journal[2:], 'effect-before-plan'),
            ('sl_cmp_effect_plan', R(A('effects'), 'journal', 2, 1), effect_id(mv['sl']['op']['compaction_id'], 4, 0, 'replace_current'), 'effect-id-other-ordinal'),
            ('sl_cmp_effect_plan', R(A('effects'), 'artifact_rewrites'), ['artifact:survivor'], 'published-artifact-rewritten'),
            ('sl_cmp_groups', R(A('groups-unissued'), 'decision'), 'proceed', 'maintenance-before-issuance'),
            ('sl_cmp_groups', R(A('groups'), 'lifecycle_group', 'events'), 2, 'lifecycle-group-batched'),
            ('sl_cmp_groups', R(A('groups'), 'lifecycle_group', 'durability_class'), 'ordinary', 'lifecycle-group-not-barrier'),
            ('sl_cmp_bytes', R(A('scan-generation'), 'decision'), 'verified', 'frame-generation-mismatch-verified'),
            ('sl_cmp_bytes', R(A('scan-hole'), 'decision'), 'verified', 'uncovered-gap-verified'),
            ('sl_cmp_bytes', R(A('scan-duplicate'), 'decision'), 'verified', 'duplicate-event-verified'),
            ('sl_cmp_bytes', R(A('scan'), 'scanned', 0, 1), 64, 'scan-from-offset'),
            ('sl_cmp_bytes', R(A('scan'), 'scanned', 1, 2), 128, 'scan-short-of-durable-end'),
            ('sl_cmp_translation', R(A('translate'), 'catchup_before_seal'), False, 'seal-before-catchup'),
            ('sl_cmp_translation', R(A('translate'), 'source_set'), ['e1', 'e2'], 'carrier-missing-from-translation'),
            ('sl_cmp_translation', R(A('translate'), 'receipt_coordinate_changes'), ['receipt:e9/segment_name'], 'carrier-rename-rewrites-receipt'),
            ('sl_cmp_translation', R(A('translate'), 'removed_current_rows'), ['e-removed'], 'removed-event-keeps-current-row'),
            ('sl_cmp_continuation', R(A('continuation-other-owner'), 'decision'), 'allowed', 'other-owner-continues'),
            ('sl_cmp_continuation', R(A('continuation-ordinary-write'), 'decision'), 'allowed', 'ordinary-write-unfenced'),
            ('sl_cmp_continuation', R(A('continuation-unproved'), 'decision'), 'allowed', 'continuation-without-committed'),
            ('sl_cmp_continuation', R(A('continuation'), 'decision'), 'fenced', 'original-owner-fenced'),
            ('sl_cmp_source_successor', R(A('successor-after-target'), 'selected'), 'source', 'source-after-target-visible'),
            ('sl_cmp_source_successor', R(A('successor-no-adapter'), 'decision'), 'create_successor', 'successor-without-adapter'),
            ('sl_cmp_source_successor', R(A('successor'), 'carrier_reopened'), True, 'carrier-reopened'),
            ('sl_cmp_final_fence', R(A('publisher-changed'), 'trace'), ['derive_afterimage', 'run_helpers', 'final_pure_check', 'publish'], 'publish-after-changed-state'),
            ('sl_cmp_final_fence', R(A('publisher'), 'trace'), ['run_helpers', 'derive_afterimage', 'final_pure_check', 'publish'], 'afterimage-after-helpers'),
            ('sl_cmp_final_fence', R(A('publisher'), 'trace'), ['derive_afterimage', 'final_pure_check', 'run_helpers', 'publish'], 'helper-after-final-check'),
            ('sl_cmp_final_fence', R(A('publisher-changed'), 'rolled_back'), ['current'], 'refusal-rolls-back'),
            ('sl_cmp_journal', R(A('journal-needed'), 'removable'), True, 'needed-member-unlinked'),
            ('sl_cmp_journal', R(A('journal-unsettled'), 'removable'), True, 'unsettled-journal-unlinked'),
            ('sl_cmp_journal', R(A('journal'), 'removable'), False, 'settled-journal-kept-forever')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    # Exceptional branches, each with its unproved disposition and successor.
    reason = 'CURRENT unreadable after crash'
    for label, prefix, spec, want in [
            ('build-fails-source-proven', ['preparing'], E('building', native(build_admitted=False, failure_reason='target allocation failed')), 'failed'),
            ('verify-ambiguous', ['preparing', 'building'], E('verified', native(target_verified=False, current='unknown', failure_reason=reason)), 'recovery_required'),
            ('commit-target-visible-incomplete', ['preparing', 'building', 'verified', 'commit_pending'],
             E('committed', native(current='target', activation='incomplete', target_visible=True, failure_reason='activation unproven')), 'recovery_required'),
            ('finalize-incomplete', ['preparing', 'building', 'verified', 'commit_pending', 'committed'],
             E('finalized', native(current='target', activation='complete', finalization='incomplete', target_visible=True, failure_reason='next active missing')), 'recovery_required'),
            ('pending-lost-source-proven', ['preparing', 'building', 'verified'], E('commit_pending', native(pending_durable=False, failure_reason='pending write failed')), 'failed'),
            ('no-reason-fenced', ['preparing', 'building'], E('verified', native(target_verified=False, current='unknown')), None)]:
        specs = [E(to, f) for to, f in ORDINARY if to in prefix] + [spec]
        control, value = build('exception-' + label, specs)
        i = len(specs) - 1
        if want:
            negatives.append(c.mutate(control, 'sl_cmp_disposition', R(i, 'successor', 1), value['sl']['runs'][i]['closed'], 'successor-reuses-closed-ordinal'))
            negatives.append(c.mutate(control, 'sl_cmp_phase', R(i, 'proved'), [spec['to'], None, 'x'], 'unproved-edge-proved'))
            negatives.append(c.mutate(control, 'sl_cmp_event', R(i, 'events_appended', 0, 'payload', 'failure_reason'),
                                      'other reason', 'reason-substituted'))
            negatives.append(c.mutate(control, 'sl_cmp_aftermath', R(i, 'aftermath', 'target_activation'), True, 'exceptional-activates'))
        else:
            negatives.append(c.mutate(control, 'sl_cmp_disposition', R(i, 'successor'), ['recovery_required', i + 1, 'x'], 'reasonless-successor'))
    # recovery_required exits: to committed with target proof, then finalized; and to failed with source proof.
    for label, exit_to, exit_facts, then in [
            ('recovery-to-committed', 'committed', native(current='target', activation='complete', target_visible=True),
             E('finalized', dict(ORDINARY[5][1]))),
            ('recovery-to-failed', 'failed', native(failure_reason='source authority proven after reconcile'), None)]:
        specs = [E(to, f) for to, f in ORDINARY[:4]] + [E('committed', native(current='target', activation='incomplete', target_visible=True, failure_reason='activation unproven')),
                                                          E(exit_to, exit_facts)] + ([then] if then else [])
        control, value = build(label, specs)
        negatives.append(c.mutate(control, 'sl_cmp_graph', R(5, 'reserved'), ['commit_pending', exit_to], 'exit-from-wrong-phase'))
        negatives.append(c.mutate(control, 'sl_cmp_phase', R(5, 'proved', 0), 'committed' if exit_to == 'failed' else 'failed', 'exit-proved-as-other-phase'))
    direct, dv = build('recovery-direct-finalized', [E(to, f) for to, f in ORDINARY[:4]]
                       + [E('committed', native(current='target', activation='incomplete', target_visible=True, failure_reason='activation unproven')),
                          E('finalized', dict(ORDINARY[5][1]))])
    negatives.append(c.mutate(direct, 'sl_cmp_graph', R(5, 'reserved'), ['recovery_required', 'finalized'], 'recovery-direct-to-finalized'))
    committed_failed, _cv = build('committed-to-failed', [E(to, f) for to, f in ORDINARY[:5]] + [E('failed', native(failure_reason='x'))])
    negatives.append(c.mutate(committed_failed, 'sl_cmp_graph', R(5, 'reserved'), ['committed', 'failed'], 'committed-to-failed-reserved'))
    manual, mnv = build('manual-initiator', [E(to, f) for to, f in ORDINARY[:2]], initiator='manual')
    negatives.append(c.mutate(manual, 'sl_cmp_event', R(0, 'events_appended', 0, 'correlation_id'),
                              'storage.compaction:' + operation_digest(NONCE), 'manual-automatic-correlation'))
    negatives.append(c.mutate(manual, 'sl_cmp_event', R(1, 'events_appended', 0, 'actor_ref'), 'storage.principal', 'manual-actor-substituted'))
    # Number and time slots.
    def copies(label, row, change, defect):
        changed = copy.deepcopy(mv); change(changed); negatives.append(c.negative(main, row, label, changed, defect))
    def length(v, x):
        v['sl']['runs'][A('detail')]['facts']['members'][0]['length'] = x
    def captured(v, x):
        r = v['sl']['runs'][A('edge-building')]; r['facts']['captured_at_utc'] = x; r['events_appended'][0]['occurred_at_utc'] = x
    copies('member-length-negative', 'sl_cmp_numbers', lambda v: length(v, -1), {'value': -1})
    copies('member-length-fraction', 'sl_cmp_numbers', lambda v: length(v, 1.5), {'value': 1.5})
    copies('capture-impossible', 'sl_cmp_time', lambda v: captured(v, '2026-02-30T00:00:00Z'), {'copies': 'proof capture and event occurrence'})
    return controls, negatives


def corpus_slots(control):
    value = control['value']; runs = s.runs_of(value, CMP)
    if not runs:
        return
    for i, r in enumerate(runs):
        if r['kind'] == 'detail' and r['facts'].get('members'):
            yield {'paths': [('sl', 'runs', i, 'facts', 'members', 0, 'length')], 'kind': 'integer', 'row': 'sl_cmp_numbers',
                   'bounds': {'minimum': 0, 'maximum': (1 << 64) - 1}, 'downstream': False, 'container_row': 'sl_cmp_numbers'}
            break
    for i, r in enumerate(runs):
        if r['kind'] == 'edge' and r.get('events_appended'):
            yield {'paths': [('sl', 'runs', i, 'facts', 'captured_at_utc'), ('sl', 'runs', i, 'events_appended', 0, 'occurred_at_utc')],
                   'kind': 'datetime', 'row': 'sl_cmp_time', 'profile': w.EVENT_RECORD, 'type_rows': ['sl_cmp_time']}
            break


def evidence(out):
    """Constructor self-check: every presented lifecycle event payload keeps its complete schema and frozen-producer shape."""
    import pm_s3bo_cases as c
    root = w.read_json('Plans/storage_compaction_native_contracts.schema.json')
    # The root is itself a closed union; reference the one definition without it.
    event_schema = {k: root[k] for k in ('$schema', '$id', '$defs') if k in root}
    event_schema['$ref'] = '#/$defs/compaction_event'
    controls, _ = c.cases(); checked = 0; bad = []
    for control in controls:
        runs = s.runs_of(control['value'], CMP)
        if runs is None:
            continue
        for i, r in enumerate(runs):
            for e in r.get('events_appended') or []:
                checked += 1
                errors = s.keyword_errors(PAYLOAD_SCHEMA, e['payload']) + s.keyword_errors(event_schema, e)
                if errors:
                    bad.append((control['id'], i, errors[:3]))
    return {'status': 'pass' if checked and not bad else 'fail', 'family': CMP, 'checked': checked, 'schema_failures': bad[:20],
            'meaning': 'Every presented control lifecycle event keeps the registered payload schema and the native compaction_event (frozen producer) schema.'}
