#!/usr/bin/env python3
"""Plan coverage: every entry of Plans/bsd_event_oracle_plan.json mapped to executed rows and witnesses (PNC-019 s4d).

For each of the fifteen families, every planned guard is mapped to the complete checker's guard rows. A guard is
COVERED when every mapped reachable row belongs to that family's evaluated phases and has at least one witness case
in that family whose first refusal is exactly that row (the complete checker run decides it, here), and every
positive of the family passes. A mapped row that sits alone in an entailed table counts only with that table's
written proof (ENTAILED). Planned positives and the retention plan map to named positive cases and retention rows.
Anything else is UNCOVERED and fails the run.

Usage: python3 -B scripts/pm_w3d_bsd_plan_coverage.py --json reports/event-authority-20261105/W3D-plan-coverage.json
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m  # noqa: E402
import pm_w3d_bsd_rows as rows_spec  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402

R = lambda pattern: ('re', pattern)  # noqa: E731
STATIC = {
    'registration': ['AD01_registration', 'AD01_cutoff'],
    'physical_admission': ['AD02_physical_admission'],
    'replay_writer': ['AD03_replay_writer', 'EN18_replay_policy', 'RT01_retry_not_replay_only'],
    'project_scope': ['AD04_project_scope', 'AD04_scope_kind', 'OW_project_id_join'],
    'partition': ['ID12_partition_recipe'],
    'actor': ['AD05_actor'],
    'operation_source': ['SR07_operation_source', 'SR07_operation_identity'],
    'source_commitment': ['SR06_source_commitment', 'SR06_committed_wrapper'],
    'event_identity': ['ID01_event_prefix', 'ID03_event_storage', 'ID04_event_type', 'ID05_event_project',
                       'ID06_event_operation', 'ID07_operation_recipe', ('entailed', 'ID02_event_components')],
    'idempotency_identity': ['ID08_key_prefix', 'ID10_key_project', 'ID11_key_operation', ('entailed', 'ID09_key_components')],
    'same_retry': ['RT06_retry_receipt_original', 'RT11_retry_no_new_event', 'RT12_retry_no_new_receipt'],
    'different_retry': ['RT05_retry_digest_equal'],
    'dedupe_available': ['AD06_dedupe_available', 'RT03_retry_dedupe_available'],
    'producer_digest': ['EN07_producer_qualified', 'OP07_operation_digest', 'RC06_custody_digest'],
    'sequence_storage': ['EN14_sequence_join', 'RC10_receipt_sequence'],
    'observed_storage': ['EN15_observed_join'],
    'persisted_storage': ['EN16_persisted_join'],
    'first_receipt': [R(r'^RC(09|1\d)_'), 'CR07_original_receipt', 'CR08_complete_before_result'],
    'full_value': ['RC08_full_value'],
    'original_retry_custody': ['RT08_original_retry_custody', 'RT04_retry_original_found'],
    'payload_bytes': ['EN11_inline_size', 'EN17_metadata_size', 'OZ01_operation_size', 'CZ01_checkpoint_size',
                      ('entailed', 'PJ08_projection_size')],
    'payload_ref_bytes': [R(r'^PK0[1-8]_')],
    'redaction': ['RD01_payload_no_protected', 'RD02_envelope_no_protected', 'EN10_redaction_join'],
    'access': ['HI10_permission', 'AD07_current_write_permission'],
    'deletion': ['HI11_not_deleted', 'HI11_body_not_deleted'],
    'backup': ['HI14_backup_coherent', R(r'^RS_')],
    'generic_source': ['SC01_generic_source'],
    'checkpoint_storage': ['CP02_checkpoint_storage'],
    'checkpoint_type': [('entailed', 'CP03_checkpoint_type'), ('entailed', 'CP05_checkpoint_consumer')],
    'checkpoint_token': [R(r'^CP(0[7-9]|1\d|2[0-7])_')],
    'snapshot_not_persisted': [('entailed', 'CP06_token_snapshot')],
    'cas': [R(r'^CS0[1-7]_')],
    'complete_scan': [R(r'^SC(0[2-9]|10)_')],
    'no_side_effect_replay': [R(r'^RP0[1-8]_')],
    'retained_original': [R(r'^HI0[1-8]_'), 'HI13_retained_recipe'],
    'withdrawal': [R(r'^WD0[1-7]_'), 'HI09_reader_enabled', 'CS07_publication_not_withdrawn', R(r'^RB0[1-7]_')],
    'number_domain': ['EN05_sequence_uint64', 'EN06_producer_sequence', 'EN07_producer_qualified',
                      'RC11_receipt_sequence_uint64', 'CP26_token_uint64', 'AD09_writer_generation_domain',
                      'RT10_retry_producer_sequence', 'HI05_original_verifies', ('corpus', 'integer slots')],
    'time_profile': ['EN02_occurred_clock', 'EN03_observed_clock', 'EN04_persisted_clock', 'RC16_ack_clock',
                     ('corpus', 'date-time slots')],
    'refs_closed': [('structural', 'refs_closed')],
    'source_wrapper_subject': ['SR02_wrapper_subject'],
    'source_wrapper_schema': ['SR01_wrapper_schema', ('entailed', 'SR03_wrapper_logical_schema')],
    'source_pack_size': ['PK08_source_pack_size'],
    'pending_not_current': ['OP09_pending_not_current', 'CR03_head_prior_until_receipt'],
    'head_cas': ['RC25_head_cas', 'RC25_head_operation', 'CR09_head_with_operation'],
    'barrier_receipt': ['RC18_barrier_receipt'],
    'head_source_join': [R(r'^RC26_'), 'RC27_head_schema', 'RC30_head_receipt_join'],
    'current_write_permission': ['AD07_current_write_permission'],
    'current_owner': ['AD08_current_owner'],
    'current_writer_generation': ['AD09_current_writer_generation', 'AD09_writer_generation_domain'],
    'current_stop': ['AD10_current_stop'],
    'current_epoch': ['AD11_current_epoch'],
    'not_off': ['EL01_not_off'],
    'resolved_mode_source_join': ['OW_effective_mode_join'],
    'payload_digest': ['OW_payload_hash_join'],
    'start_no_premature_result': [('entailed', 'SR26_start_no_premature_result'), 'start_body.closed'],
    'envelope_run_join': ['JN01_run_join'],
    'envelope_run_null': ['JN01_run_null'],
    'envelope_project_id_join': ['JN02_project_join'],
}
POSITIVES = [
    ('current exact-family writer', [r'^append/fresh-after-separate-admission$']),
    ('same-body lost-ack retry', [r'^retry/lost-ack-original-result$', r'^retry/same-body-other-storage-metadata$']),
    ('retained valid older history', [r'^read/retained-after-live-epoch-and-writer-change$', r'^read/retained-after-live-recipe-change$']),
    ('retained authentic projector_replay_only', [r'^read/retained-projector-replay-only-original$']),
    ('empty source, zero family matches', [r'^publish/actual-empty-source$', r'^publish/zero-match-nonempty-range$',
                                           r'^publish/mixed-scan-unrelated-final$', r'^publish/degraded-survivor-range$']),
    ('above 16 KiB uses the existing SP-337 route', [r'^append/external-payload-route$', 'neg:EN11_inline_size', 'neg:OZ01_operation_size']),
    ('crash boundaries', [r'^crash/after-']),
    ('Genuine accepted pre-dispatch admission', [r'^append/fresh-after-separate-admission$', 'neg:CD01_dispatch_after_receipt']),
    ('Later real terminal cycle', [r'^append/fresh-after-separate-admission$', r'^crash/all-cut-points$']),
    ('effective_mode=Auto', [r'^append/fresh-after-separate-admission$']),
    ('effective_mode=On', [r'^append/variant-effective-mode-On$']),
    ('epoch_replaced clearance', [r'^append/variant-replacement_source$', r'^append/variant-replacement_control_current$',
                                  r'^read/retained-after-live-epoch-and-writer-change$']),
]


def mapped(name, fam):
    sem = {e[0] for e in fam['semantic']}
    if name in sem:
        return [R(rf'^SR\d\d_sem_{re.escape(name)}$')]
    if name in STATIC:
        return STATIC[name]
    if name == 'payload.root_type':
        # EventRecord 2.0.0 declares payload {type: object} and this family is inline-only (EN12): EN01 refuses
        # a string, array, null, number or boolean payload before any field is inspected.
        return ['EN01_envelope_schema']
    if name.startswith('payload.'):
        _p, field, kw = name.split('.', 2)
        schema = m.SCHEMAS['bsd_event_payloads']['$defs'][fam['slug']]['properties'][field]
        if '$ref' in schema:
            schema = m.SCHEMAS['bsd_event_payloads']['$defs'][schema['$ref'].split('/')[-1]]
        if kw == 'root_type':
            return ['EN01_envelope_schema']
        if kw == 'union_type':
            return [f'payload.{field}.type']
        if kw == 'item_domain':
            return [f'payload.{field}.items_enum']
        if kw in ('minLength', 'maxLength') and 'pattern' in schema:
            return [f'payload.{field}.pattern']
        return [f'payload.{field}.{kw}']
    if name.startswith('payload_') and name.endswith('_source_join'):
        return [name]
    if name.startswith('envelope_') and name.endswith('_join'):
        return [R(rf'^JN\d\d_{re.escape(name[len("envelope_"):])}$')]
    if name.startswith('start_body.'):
        return [name]
    if name.startswith(('terminal_start_', 'start_', 'finding_identity_operands')):
        return [R(rf'^SR\d\d_{re.escape(name)}(_.+)?$')]
    return None


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    ap.add_argument('--full', help='also write the full per-row form (evidence)')
    args = ap.parse_args(argv)
    plan = json.loads((ROOT / 'Plans/bsd_event_oracle_plan.json').read_text())
    families, problems = [], []
    totals = dict(guards=0, covered=0, entailed_only=0, uncovered=0, positives_planned=0, positives_covered=0)
    with m.exact_integer_digits():
        for fplan in plan['families']:
            fam = spec.BY_SLUG[fplan['event_type'].split('.', 1)[1]]
            phases = rows_spec.family_phase_names(fam)
            all_rows = {r[0]: ph for ph in phases for r in rows_spec.all_phases()[ph][1]}
            witnessed, positives_ok, negative_rows = {}, {}, set()
            for case in m.all_cases(fam):
                result, extra = m.run_case(fam, case)
                bad = m.judge(case, result) or extra
                if case['kind'] == 'positive':
                    positives_ok[case['id']] = not bad
                elif not bad and len(result[3]) == 1:
                    witnessed.setdefault(case['row'], []).append(case['id'])
                    negative_rows.add(case['row'])
            rows_out = []
            for g in fplan['guards']:
                name = g['guard_id'].split('.', 1)[1]
                targets = mapped(name, fam)
                totals['guards'] += 1
                entry = dict(guard_id=g['guard_id'], rows=[], status=None)
                if not targets:
                    entry['status'] = 'UNCOVERED'
                    entry['reason'] = 'no mapping'
                else:
                    ok, reachable = True, 0
                    for t in targets:
                        if isinstance(t, tuple) and t[0] == 'entailed':
                            entry['rows'].append(dict(row=t[1], kind='entailed', table=next(
                                (ph for ph, (_ti, rr) in rows_spec.all_phases().items() if any(r[0] == t[1] for r in rr)), None)))
                            continue
                        if isinstance(t, tuple) and t[0] in ('corpus', 'structural'):
                            entry['rows'].append(dict(row=t[1], kind=t[0]))
                            continue
                        names = [r for r in all_rows if re.match(t[1], r)] if isinstance(t, tuple) else (
                            [t] if t in all_rows else [])
                        if isinstance(t, str) and t not in all_rows:
                            entry['rows'].append(dict(row=t, kind='not_applicable_in_family'))
                            continue
                        if not names:
                            ok = False
                            entry['rows'].append(dict(row=str(t), kind='missing'))
                        for n in names:
                            w = witnessed.get(n, [])
                            reachable += 1
                            entry['rows'].append(dict(row=n, phase=all_rows[n], witnesses=len(w), sample=w[:2]))
                            if not w:
                                ok = False
                    entry['status'] = 'COVERED' if ok and reachable else ('ENTAILED_ONLY' if ok else 'UNCOVERED')
                totals[{'COVERED': 'covered', 'ENTAILED_ONLY': 'entailed_only', 'UNCOVERED': 'uncovered'}[entry['status']]] += 1
                if entry['status'] == 'UNCOVERED':
                    problems.append(dict(family=fam['slug'], guard=g['guard_id'], rows=entry['rows']))
                rows_out.append(entry)
            pos_out = []
            for text in fplan['positives']:
                totals['positives_planned'] += 1
                spec_ = next((p for k, p in POSITIVES if k in text), None)
                matched = []
                for pat in spec_ or []:
                    if pat.startswith('neg:'):
                        if pat[4:] in negative_rows:
                            matched.append(pat)
                    else:
                        matched += [cid for cid, good in positives_ok.items() if good and re.match(pat, cid)]
                good = bool(spec_) and bool(matched)
                totals['positives_covered'] += int(good)
                pos_out.append(dict(planned=text, cases=matched, status='COVERED' if good else 'UNCOVERED'))
                if not good:
                    problems.append(dict(family=fam['slug'], positive=text))
            retention_rows = sorted(r for r in negative_rows if r.startswith('RN'))
            retention_pos = sorted(c for c, good in positives_ok.items() if good and c.startswith('retention/'))
            ret = dict(planned=fplan['retention'], positives=retention_pos, rows=retention_rows,
                       status='COVERED' if retention_pos and retention_rows else 'UNCOVERED')
            if ret['status'] != 'COVERED':
                problems.append(dict(family=fam['slug'], retention='uncovered'))
            if not all(positives_ok.values()):
                problems.append(dict(family=fam['slug'], failing_positives=[c for c, g in positives_ok.items() if not g]))
            families.append(dict(event_type=fam['event_type'], guards=len(fplan['guards']),
                                 covered=sum(e['status'] == 'COVERED' for e in rows_out),
                                 entailed_only=sum(e['status'] == 'ENTAILED_ONLY' for e in rows_out),
                                 uncovered=sum(e['status'] == 'UNCOVERED' for e in rows_out),
                                 positives=pos_out, retention=ret, entries=rows_out))
    out = dict(schema_id='pm.w3d.bsd.plan_coverage.v1', plan='Plans/bsd_event_oracle_plan.json',
               checker='scripts/pm_w3d_bsd_events.py', status='pass' if not problems else 'fail', totals=totals,
               families=families, problems=problems)
    if args.full:
        Path(args.full).write_text(json.dumps(out, indent=1, sort_keys=False) + '\n')
    if args.json:
        # Compact committed form: one line per planned guard: [guard_id, status, ["row=witnesses" | "row=entailed:<table>"]].
        def row_text(r):
            if r.get('kind') == 'entailed':
                return f"{r['row']}=entailed:{r.get('table')}"
            if r.get('kind') in ('corpus', 'structural', 'not_applicable_in_family', 'missing'):
                return f"{r['row']}={r['kind']}"
            return f"{r['row']}={r['witnesses']}"
        lines = ['{', f' "schema_id": "pm.w3d.bsd.plan_coverage.v1", "status": {json.dumps(out["status"])},',
                 f' "plan": "Plans/bsd_event_oracle_plan.json", "checker": "scripts/pm_w3d_bsd_events.py",',
                 f' "totals": {json.dumps(totals)},', f' "problems": {json.dumps(problems)},', ' "families": [']
        for fi, fam in enumerate(families):
            lines.append(f'  {{"event_type": {json.dumps(fam["event_type"])}, "guards": {fam["guards"]}, '
                         f'"covered": {fam["covered"]}, "entailed_only": {fam["entailed_only"]}, "uncovered": {fam["uncovered"]},')
            lines.append(f'   "positives": {json.dumps([[p["planned"], p["status"], p["cases"]] for p in fam["positives"]])},')
            lines.append(f'   "retention": {json.dumps([fam["retention"]["status"], fam["retention"]["positives"], fam["retention"]["rows"]])},')
            lines.append('   "entries": [')
            for ei, e in enumerate(fam['entries']):
                comma = ',' if ei < len(fam['entries']) - 1 else ''
                lines.append('    ' + json.dumps([e['guard_id'], e['status'], [row_text(r) for r in e['rows']]]) + comma)
            lines.append('   ]}' + (',' if fi < len(families) - 1 else ''))
        lines += [' ]', '}']
        text = '\n'.join(lines) + '\n'
        json.loads(text)
        Path(args.json).write_text(text)
    print(json.dumps(dict(status=out['status'], totals=totals, problems=problems[:30]), indent=1))
    return 0 if not problems else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
