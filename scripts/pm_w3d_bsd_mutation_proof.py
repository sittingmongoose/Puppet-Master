#!/usr/bin/env python3
"""Strict complete-path mutation witnesses, plus the recheck's derivations and ten fresh rows.

Only an explicitly expected acceptance or exact first (phase,row,code) refusal is a kill.
Unexpected refusal, exception, missing witness, dirty baseline or failed restoration is a survivor.
The replay-only duplicate is cut per clause, at each site and jointly; append_once stays refused.
All derivation mutations replace source inside the actual function, never returned observations.
"""
import argparse
import inspect
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m
import pm_w3d_bsd_spec as spec

TARGETS = [
    ('advice_emitted', 'admission', 'AD03_replay_writer'),
    ('advice_emitted', 'envelope', 'EN02_occurred_clock'),
    ('advice_emitted', 'envelope', 'EN05_sequence_uint64'),
    ('advice_emitted', 'identity', 'ID07_operation_recipe'),
    ('advice_emitted', 'pack', 'PK02_pack_digest'),
    ('advice_emitted', 'receipt', 'RC08_full_value'),
    ('advice_emitted', 'history', 'HI01_receipt_present'),
    ('advice_emitted', 'history', 'HI07_no_receipt_created'),
    ('assignment_started', 'eligibility', 'EL01_not_off'),
    ('finding_reconfirmed', 'source', 'SR09_sem_newer_generation'),
    ('policy_changed', 'source', 'SR08_sem_revision_cas'),
    ('review_started', 'source', 'SR24_start_admission_identity'),
]
# label, function, exact source clause, replacement, target row, witness label fragment, family
DERIVATIONS = [
    ('R01 finding_ref pattern', 'obs_payload', "re.search(spec_['pattern'], value) is not None",
     "(True if fam['slug'] == 'advice_emitted' and field == 'finding_ref' else re.search(spec_['pattern'], value) is not None)", 'payload.finding_ref.pattern', None, 'advice_emitted'),
    ('R02 policy_revision type', 'obs_payload', 'type(value) is want',
     "(True if fam['slug'] == 'advice_emitted' and field == 'policy_revision' else type(value) is want)", 'payload.policy_revision.type', None, 'advice_emitted'),
    ('R03 schema_version const', 'obs_payload', "value == spec_['const']",
     "(True if fam['slug'] == 'advice_emitted' and field == 'schema_version' else value == spec_['const'])", 'payload.schema_version.const', None, 'advice_emitted'),
    ('R04 wrapper subject', 'obs_source', "same(wrapper.get('subject_id'), payload.get(fam['subject_field']))", 'True', 'SR02_wrapper_subject', None, None),
    ('R05 committed wrapper membership', 'obs_source', "payload.get('source_state_ref') in W['committed_wrappers']", 'True', 'SR06_committed_wrapper', None, None),
    ('R06 operation committed', 'obs_source', "W['operation_committed'] is True", 'True', 'SR07_operation_source', None, None),
    ('R07 full value commitment', 'obs_receipt', "same(\n            custody.get('original_event_value_commitment', {}).get('sha256'), commitment)", 'True', 'RC08_full_value', None, None),
    ('R08 prior head CAS', 'obs_receipt', "same(W['head_expected'], prior)", 'True', 'RC25_head_cas', None, None),
    ('R09 head subject', 'obs_receipt', "same(head.get('subject_id'), W['native']['subject_id'])", 'True', 'RC26_head_subject', None, None),
    ('R10 sealed receipt presence', 'obs_history', 'len(sealed) >= 1', 'True', 'HI01_receipt_present', None, None),
    ('R11 stored bytes snapshot', 'perform_retained_read', 'bytes_after == bytes_before', 'True', 'HI06_bytes_preserved', None, None),
    ('R12 sealed store snapshot', 'perform_retained_read', "Rc['sealed'] == sealed_before", 'True', 'HI07_no_receipt_created', None, None),
    ('R13 frozen timestamps', 'frozen_verify', 'and clocks_ok', 'and True', 'HI05_original_verifies', 'frozen ', None),
    ('R14 frozen payload schema', 'frozen_verify', 'and payload_ok', 'and True', 'HI05_original_verifies', 'frozen payload ', None),
    ('R15 frozen identity', 'frozen_verify', 'and identity_ok', 'and True', 'HI05_original_verifies', 'frozen ', None),
    ('O01 observed timestamp', 'obs_envelope', "clock_ok(env.get('observed_at_utc'), STORAGE_UTC_Z)", 'True', 'EN03_observed_clock', None, None),
    ('O02 persisted timestamp', 'obs_envelope', "clock_ok(env.get('persisted_at_utc'), STORAGE_UTC_Z)", 'True', 'EN04_persisted_clock', None, None),
    ('O03 thread join', 'obs_joins', 'same(env.get(field), native[field])', "(True if field == 'thread_id' else same(env.get(field), native[field]))", 'JN03_thread_id_join', None, None),
    ('O04 operation key', 'obs_operation', '''W['operation_key'] == (
            f'bsd_{fam["slug"]}_operation.v1:{partition_for(PROJECT)}:{hexs(W["operation_id"])}')''', 'True', 'OP02_operation_key', None, None),
    ('O05 operation storage', 'obs_operation', "op.get('storage_instance_id') == STORAGE", 'True', 'OP03_operation_storage', None, None),
    ('O06 pack byte size', 'obs_pack', "str(len(raw)) == parts[4]", 'True', 'PK03_pack_size', None, None),
    ('O07 settlement receipt ref', 'obs_receipt', "same(row.get('first_append_receipt_ref'), W['receipt_ref'])", 'True', 'RC19_settlement_ref', None, None),
    ('O08 checkpoint storage', 'obs_checkpoint', "cand.get('storage_instance_id') == STORAGE", 'True', 'CP02_checkpoint_storage', None, None),
    ('O09 publication fence', 'obs_cas', "request.get('fence') == W['storage_fence']", 'True', 'CS06_fence_current', None, None),
    ('O10 withdrawal cutoff', 'obs_withdrawal', "D['cutoff_recorded'] is True", 'True', 'WD01_cutoff_recorded', None, None),
]


def first(result):
    return list(result[:3]) if result else None


def expected(case):
    return [case['phase'], case['row'], m.code_of(case['phase'], case['row'])]


def execute(fam, case):
    try:
        result, extra = m.run_case(fam, case)
        return first(result), extra
    except Exception as error:
        return {'exception': type(error).__name__, 'message': str(error)}, None


def replace(fn, old, new):
    original = getattr(m, fn)
    source = inspect.getsource(original)
    if source.count(old) != 1:
        raise ValueError((fn, old, source.count(old)))
    exec(compile(source.replace(old, new), '<W3D derivation mutation>', 'exec'), m.__dict__)
    return original


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    args = ap.parse_args(argv)
    results = []
    with m.exact_integer_digits():
        catalog = [(f, c) for f in spec.FAMILIES for c in m.all_cases(f)]
        baseline_errors = []
        for fam, case in catalog:
            raw, error = m.run_case(fam, case)
            mismatch = m.judge(case, raw) or error
            if mismatch:
                baseline_errors.append(dict(family=fam['slug'], case=case['id'], actual=first(raw), error=mismatch))
        if baseline_errors:
            result = dict(status='fail', baseline_errors=baseline_errors)
        else:
            # Original 12 table-site probes, now judged against explicit expectations.
            original_observe = m.observe
            for slug, phase, row in TARGETS:
                fam = spec.BY_SLUG[slug]
                phase = m.rows_spec.phase_name(phase, fam) if phase in ('admission','source','eligibility') else phase
                case = next(c for f, c in catalog if f is fam and c['kind'] == 'negative' and c.get('phase') == phase and c.get('row') == row)
                def weakened(phase_arg, W, _row=row):
                    obs = original_observe(phase_arg, W)
                    if _row in obs:
                        obs[_row] = True
                    return obs
                m.observe = weakened
                try:
                    actual, error = execute(fam, case)
                finally:
                    m.observe = original_observe
                want = ['envelope','EN18_replay_policy','replay_policy_invalid'] if row == 'AD03_replay_writer' else None
                restored, restore_error = execute(fam, case)
                good = actual == want and not error and restored == expected(case) and not restore_error
                results.append(dict(group='table-site', mutation=row, expected=want, actual=actual,
                    reason='The same replay-only value is refused at the explicitly named envelope policy clause.' if want else 'The isolated weakened witness must be accepted.',
                    restored=restored, killed=good))
            # Duplicate proof: cut only projector_replay_only in EN18, preserving append_once refusal.
            fam = spec.BY_SLUG['advice_emitted']
            case = next(c for f,c in catalog if f is fam and c.get('row') == 'AD03_replay_writer')
            peer = next(c for f,c in catalog if f is fam and c.get('row') == 'EN18_replay_policy')
            old = "env.get('replay_policy') == 'dedupe_by_idempotency_key'"
            fn = replace('obs_envelope', old, "env.get('replay_policy') in ('dedupe_by_idempotency_key', 'projector_replay_only')")
            try:
                actual, error = execute(fam, case)
                results.append(dict(group='duplicate', mutation='EN18 replay-only clause alone', expected=expected(case),
                    actual=actual, reason='AD03 still forbids precisely this same replay-only value.', killed=actual==expected(case) and not error))
                def weaken_ad03(phase_arg, W):
                    obs = original_observe(phase_arg, W)
                    if 'AD03_replay_writer' in obs:
                        obs['AD03_replay_writer'] = True
                    return obs
                m.observe = weaken_ad03
                try:
                    actual, error = execute(fam, case)
                    peer_actual, peer_error = execute(fam, peer)
                finally:
                    m.observe = original_observe
                results.append(dict(group='duplicate', mutation='AD03 + EN18 replay-only clause joint cut', expected=None,
                    actual=actual, peer_expected=expected(peer), peer_actual=peer_actual,
                    reason='Both sites of the replay-only invariant removed; the independent append_once refusal stays enabled.',
                    killed=actual is None and not error and peer_actual==expected(peer) and not peer_error))
            finally:
                m.obs_envelope = fn
            # Real derivations: every matching single-defect witness in every applicable family.
            for label, fn, old, new, row, fragment, slug in DERIVATIONS:
                witnesses = [(f,c) for f,c in catalog if c['kind']=='negative' and c.get('row')==row and (slug is None or f['slug']==slug)]
                if label.startswith('R13'):
                    witnesses = [(f,c) for f,c in witnesses if 'frozen ' in c['label'] and 'clock' in c['label']]
                elif label.startswith('R14'):
                    witnesses = [(f,c) for f,c in witnesses if c['label'] in ('frozen payload schema','frozen payload identifier')]
                elif label.startswith('R15'):
                    witnesses = [(f,c) for f,c in witnesses if c['label'] in ('frozen event identity','frozen key identity','frozen operation identity')]
                original = replace(fn, old, new)
                outcomes = []
                paths = {c['path'] for _,c in witnesses}
                controls = [(f,c) for f,c in catalog if c['kind']=='positive' and c['path'] in paths and (slug is None or f['slug']==slug)]
                try:
                    for fam,case in witnesses + controls:
                        actual,error = execute(fam,case)
                        # Removing the observed receipt-presence check admits its witness at the
                        # complete path. The independent dispatcher diagnostic still detects the
                        # now-inconsistent observation; record that exact expected diagnostic.
                        expected_extra = ('RetainedDispatcher disagrees with HI01-HI05/HI13'
                                          if label.startswith('R10') and case['kind'] == 'negative' else None)
                        outcomes.append(dict(family=fam['slug'], case=case['id'], kind=case['kind'], expected=None,
                                             actual=actual, expected_extra=expected_extra, extra=error,
                                             matches=actual is None and error == expected_extra))
                finally:
                    setattr(m,fn,original)
                restore_bad=[]
                for fam,case in witnesses:
                    actual,error=execute(fam,case)
                    if actual!=expected(case) or error:
                        restore_bad.append(dict(family=fam['slug'],case=case['id'],actual=actual,error=error))
                good=bool(witnesses) and all(o['matches'] for o in outcomes) and not restore_bad
                item=dict(group='recheck' if label.startswith('R') else 'own', mutation=label, function=fn,
                          old=old,new=new,row=row,witnesses=len(witnesses),controls=len(controls),
                          expected='accepted after the single derivation is weakened',outcomes=outcomes,
                          restore_errors=restore_bad,killed=good)
                results.append(item)
                print(json.dumps({k:v for k,v in item.items() if k not in ('outcomes','old','new')}),flush=True)
            result=dict(status='pass' if all(r['killed'] for r in results) else 'fail', baseline_cases=len(catalog),
                        groups={g:dict(killed=sum(r['killed'] for r in results if r['group']==g), total=sum(r['group']==g for r in results))
                                for g in ('table-site','duplicate','recheck','own')},results=results)
    if args.json:
        Path(args.json).write_text(json.dumps(result,indent=1)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='results'},indent=1))
    return 0 if result['status']=='pass' else 1


if __name__ == '__main__':
    sys.exit(main())
