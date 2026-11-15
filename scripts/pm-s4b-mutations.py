#!/usr/bin/env python3
"""s4b mutation proof: weaken one predicate or one piece of derivation code in a scratch copy of the checker,
regenerate the guard tables there, and probe the affected row.

A mutation counts as killed only when (kind 'witness') one of its row's own witnesses that the unmutated checker
refuses at exactly that row is now accepted; (kind 'refused_at') such a witness is now refused first at exactly the
stated other row; (kind 'control') the stated control is now refused at exactly the stated row; or (kind 'check') the
stated cross-check (known_answers, agreement) now fails. Anything else is a survivor.

  python3 scripts/pm-s4b-mutations.py --scratch DIR [--json OUT] [--only ID]
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKER = 'scripts/pm_s4b_browser_events.py'
F = ['browser.program.completed', 'browser.controller_lease.takeover_completed', 'browser.representation.captured',
     'browser.routine.promoted', 'browser.session.reconstructed_on_host', 'browser.page.activated']

# (id, row, old text in the checker, new text, kind, extra)
MUTATIONS = [
    ('C01', 'append_admitted', "lambda w, m: {'presented': w['family'], 'collection': w['store']['registry']}",
     "lambda w, m: {'presented': w['family'], 'collection': list(FAMILIES)}", 'witness', None),
    ('C02', 'append_writer_cutoff', "    lambda w, m: {'presented': w['family'], 'collection': w['store']['withdrawn']}, gates=('fam',),\n    witnesses=[W('family withdrawn'",
     "    lambda w, m: {'presented': w['family'], 'collection': []}, gates=('fam',),\n    witnesses=[W('family withdrawn'", 'witness', None),
    ('C03', 'append_dedupe_caught_up', "    lambda w, m: EQ(w['store']['dedupe_through'], w['store']['log'][-1]['sequence_id'] if w['store']['log'] else 0),",
     "    lambda w, m: EQ(w['store']['dedupe_through'], w['store']['dedupe_through']),", 'witness', None),
    ('C04', 'append_source_committed', "lambda w, m: EQ(S(w)['outcome'], 'committed')", "lambda w, m: EQ('committed', 'committed')", 'witness', None),
    ('C05', 'append_lineage_thread', "(lambda k: lambda w, m: EQ(E(w)[k], P(w)['context'][k]))(_k)",
     "(lambda k: lambda w, m: EQ(E(w)[k], P(w)['context']['node_id' if k == 'thread_id' else k]))(_k)", 'control', ('append-linked:browser.routine.promoted', 'append_lineage_thread')),
    ('C06', 'append_copy_requested_account', "(lambda k: lambda w, m: EQ(E(w)[k], S(w)[COPY_SOURCE.get(k, k)]))(_k)",
     "(lambda k: lambda w, m: EQ(E(w)[k], S(w)['effective_account_ref' if k == 'requested_account_ref' else COPY_SOURCE.get(k, k)]))(_k)", 'control', ('append-linked:browser.routine.promoted', 'append_copy_requested_account')),
    ('C07', 'append_event_id', "lambda w, m: EQ(E(w)['event_id'], m.get('recomputed')[0])", "lambda w, m: EQ(E(w)['event_id'], E(w)['event_id'])", 'witness', None),
    ('C08', 'append_producer_route', "    lambda w, m: V(m.get('digest_reason')), gates=('pay_ok',),", "    lambda w, m: V(None), gates=('pay_ok',),", 'witness', None),
    ('C09', 'append_inline_limit', "lambda w, m: {'presented': physical_size(P(w)), 'limit': INLINE_LIMIT}, gates=('pay_dict',)",
     "lambda w, m: {'presented': physical_size(P(w)), 'limit': 2 * INLINE_LIMIT}, gates=('pay_dict',)", 'witness', None),
    ('C10', 'append_payload_integers', "    lambda w, m: V(payload_integer_reason(w['family'], P(w))), gates=('pay_dict',),",
     "    lambda w, m: V(None), gates=('pay_dict',),", 'witness', None),
    ('C11', 'append_observed_utc_z', "lambda w, m: V(reason_of(date_time, E(w)['observed_at_utc'], profile=STORAGE_UTC_Z))",
     "lambda w, m: V(reason_of(date_time, E(w)['observed_at_utc'], profile=EVENT_RECORD))", 'witness', None),
    ('C12', 'append_storage_sequence_id', "(lambda k: lambda w, m: EQ(E(w)[k], w['storage_record'][k]))(_k)",
     "(lambda k: lambda w, m: EQ(E(w)[k], (E(w) if k == 'sequence_id' else w['storage_record'])[k]))(_k)", 'witness', None),
    ('C13', 'append_partition', "lambda w, m: EQ(w['scope_partition'], partition_of(E(w)['project_id']))",
     "lambda w, m: EQ(w['scope_partition'], w['scope_partition'])", 'witness', None),
    ('C14', 'append_custody_semantic', "    ('semantic', 'producer_semantic_digest', lambda w: digest_of(E(w))),",
     "    ('semantic', 'producer_semantic_digest', lambda w: w['custody_receipt']['producer_semantic_digest']),", 'witness', None),
    ('C15', 'append_receipt_acknowledged', "(lambda k: lambda w, m: EQ(_receipt(w).get(k), w['storage_record'][k]))(_k)",
     "(lambda k: lambda w, m: EQ(_receipt(w).get(k), (_receipt(w) if k == 'acknowledged_at_utc' else w['storage_record'])[k]))(_k)", 'witness', None),
    ('C16', 'append_success_receipt', "EQ(w['reported_outcome'], 'success' if w['store']['issuance'] == 'synced' else 'unresolved')",
     "EQ(w['reported_outcome'], 'success')", 'witness', None),
    ('C17', 'append_fact_effect_state', "(lambda k: lambda w, m: EQ(P(w)['facts'][k], SP_(w)['facts'][k]))(_k)",
     "(lambda k: lambda w, m: EQ(P(w)['facts'][k], (P(w) if k == 'effect_state' else SP_(w))['facts'][k]))(_k)", 'witness', None),
    ('C18', 'append_context_program', "(lambda k: lambda w, m: EQ(P(w)['context'][k], SP_(w)['context'][k]))(_k)",
     "(lambda k: lambda w, m: EQ(P(w)['context'][k], SP_(w)['context']['browser_page_id' if k == 'program_id' else k]))(_k)", 'control', ('append:browser.program.completed', 'append_context_program')),
    ('C19', 'append_pred_new_fence_page_generation', "_fx(p)['new_fence']['page_generation'] == _ctx(p)['page_generation'],",
     "_fx(p)['old_fence']['page_generation'] == _ctx(p)['page_generation'],", 'witness', None),
    ('C20', 'append_pred_takeover_epoch_advances', "_fx(p)['new_fence']['lease_epoch'] > _fx(p)['old_fence']['lease_epoch'],",
     "_fx(p)['new_fence']['lease_epoch'] >= _fx(p)['old_fence']['lease_epoch'],", 'witness', None),
    ('C21', 'append_envelope_schema', "    return Draft202012Validator({'$ref': ref}, registry=REGISTRY, format_checker=DATETIME_FORMATS)",
     "    return Draft202012Validator({'$ref': ref}, registry=REGISTRY)", 'witness', None),
    ('C22', 'retry_writer_cutoff', "    lambda w, m: {'presented': w['family'], 'collection': w['store']['withdrawn']}, gates=('r_obj',),",
     "    lambda w, m: {'presented': w['family'], 'collection': []}, gates=('r_obj',),", 'witness', None),
    ('C23', 'retry_semantic', "lambda w, m: EQ(_or(lambda: digest_of(C(w)), None), _hit(w)['digest'])",
     "lambda w, m: EQ(_hit(w)['digest'], _hit(w)['digest'])", 'witness', None),
    ('C24', 'retry_result_receipt', "lambda w, m: EQ(w['result']['receipt_hex'], _sealed_for(w, _hit(w)['event_id'])[0]['receipt_hex'])",
     "lambda w, m: EQ(w['result']['receipt_hex'], w['result']['receipt_hex'])", 'witness', None),
    ('C25', 'derived_count', "    ('count', 'count_join', ('matched_count',), lambda w: _expected_scan(w)[0]),",
     "    ('count', 'count_join', ('matched_count',), lambda w: PV(w)['matched_count']),", 'witness', None),
    ('C26', 'derived_previous', "    ('previous', 'checkpoint_cas_conflict', ('previous_checkpoint_sha256',), lambda w: None if w['prior'] is None else binding_hash(w['prior'])),",
     "    ('previous', 'checkpoint_cas_conflict', ('previous_checkpoint_sha256',), lambda w: PV(w)['previous_checkpoint_sha256']),", 'witness', None),
    ('C27', 'derived_token_generation_id', "(lambda k: lambda w, m: EQ(TOK(w)[k], durable_token(w['store']['selection'])[k]))(_k)",
     "(lambda k: lambda w, m: EQ(TOK(w)[k], (TOK(w) if k == 'generation_id' else durable_token(w['store']['selection']))[k]))(_k)", 'witness', None),
    ('C28', 'derived_count', "    count = sum(1 for e in log if e['event_type'] == family and e['partition'] == partition)",
     "    count = sum(1 for e in log if e['event_type'] == family)", 'check', 'known_answers'),
    ('C29', 'append_event_id', "    digest = hashlib.sha256(qualified_jcs(tuple_)).hexdigest()\n    return FAM[family]['event_id_prefix'] + digest",
     "    digest = hashlib.sha256(qualified_jcs(tuple_[:4])).hexdigest()\n    return FAM[family]['event_id_prefix'] + digest", 'check', 'known_answers'),
    ('C30', 'retained_frozen_identity', "    return all(component_holds(name, value) for name, value in frozen_components(custody).items())",
     "    return True", 'check', 'agreement'),
    ('C31', 'retained_no_receipt_creation', "    lambda w, m: EQ(m.get('retained')['store_after'], m.get('retained')['store_before']),",
     "    lambda w, m: EQ(m.get('retained')['store_before'], m.get('retained')['store_before']),", 'witness', None),
    ('C32', 'retained_no_current_gate', "    pm_event_numbers.current_append_policy = counting\n    module.current_append_policy = counting",
     "    pass", 'witness', None),
    ('C33', 'retained_receipt_present', "        matches = [r for r in self._store if type(r) is dict and r.get('original_ref') == original_ref]",
     "        matches = [r for r in self._store if type(r) is dict][:1]", 'refused_at', 'retained_binding'),
    ('C34', 'cleanup_window', "    lambda w, m: V(instant(w['now']) >= after_seconds(instant(m.get('cl_target')['withdrawn_at_utc']), RETENTION_WINDOW_SECONDS)),",
     "    lambda w, m: V(True),", 'witness', None),
    ('C35', 'cleanup_not_held', "'empty', lambda w, m: V(m.get('cl_target')['hold_refs']),",
     "'empty', lambda w, m: V(w['prior']['hold_refs']),", 'witness', None),
    ('C36', 'read_access', "    lambda w, m: V(w['store']['access'].get(w['request']['project_id']) is True), gates=('rd_ok',),",
     "    lambda w, m: V(True), gates=('rd_ok',),", 'witness', None),
    ('C37', 'withdrawal_no_event', "    'withdrawal appends no event', 'eq', lambda w, m: EQ(w['log_after'], w['log_before']), gates=('wd_ok',),",
     "    'withdrawal appends no event', 'eq', lambda w, m: EQ(w['log_before'], w['log_before']), gates=('wd_ok',),", 'witness', None),
    ('C38', 'rebuild_retired_head', "    ('retired_head', 'retired_join', lambda w: PV(w)['retired_generations'][:1], lambda w: [retired_core(w['prior'])]),",
     "    ('retired_head', 'retired_join', lambda w: PV(w)['retired_generations'][:1], lambda w: PV(w)['retired_generations'][:1]),", 'witness', None),
    ('C39', 'append_payload_schema', "PAYLOADS = _load('browser_event_payloads.schema.json')",
     "PAYLOADS = _load('browser_event_payloads.schema.json')\nfor _d in PAYLOADS['$defs'].values():\n    _d.pop('unevaluatedProperties', None)", 'witness', None),
    ('C40', 'derived_value_schema', "CHECKPOINTS = _load('browser_program_event_contracts.schema.json')",
     "CHECKPOINTS = _load('browser_program_event_contracts.schema.json')\nfor _d in CHECKPOINTS['$defs'].values():\n    _d.pop('allOf', None)", 'witness', None),
    ('C41', 'retained_frozen_payload_schema', "        out['payload_schema'] = (schema_errors(PAYLOADS_ID, '/$defs/' + FAM[family]['payload_def'], record['payload'])",
     "        out['payload_schema'] = [] if True else (schema_errors(PAYLOADS_ID, '/$defs/' + FAM[family]['payload_def'], record['payload'])", 'witness', None),
    ('C42', 'retry_no_append', "'a retry appends no second record', 'eq', lambda w, m: EQ(w['log_after'], w['log_before'])",
     "'a retry appends no second record', 'eq', lambda w, m: EQ(w['log_after'], w['log_after'])", 'witness', None),
    ('C43', 'read_coverage', "    return type(t) is int and type(w['request']['sequence_id']) is int and w['request']['sequence_id'] <= t",
     "    return type(t) is int", 'witness', None),
    ('C44', 'rebuild_publication_new', "                  'collection': [w['prior']['publication_id']] + [r['publication_id'] for r in w['prior']['retired_generations']]},",
     "                  'collection': []},", 'witness', None),
    ('C45', 'cleanup_remaining', "    lambda w, m: EQ(PV(w)['retired_generations'], [r for r in w['prior']['retired_generations'] if r['publication_id'] != w['target']]),",
     "    lambda w, m: EQ(PV(w)['retired_generations'], PV(w)['retired_generations']),", 'witness', None),
    ('C46', 'derived_prior_current', "    lambda w, m: V(w['prior'] is None or w['prior'].get('state') == 'current'), gates=('d_ok',),",
     "    lambda w, m: V(True), gates=('d_ok',),", 'witness', None),
    ('C47', 'append_source_family', "lambda w, m: EQ(S(w)['event_type'], w['family'])", "lambda w, m: EQ(w['family'], w['family'])", 'witness', None),
    ('C48', 'retained_override', "            recipe_override=world['recipe_override'])", "            recipe_override=None)", 'witness', None),
    ('C49', 'append_replay_only', "def policy_reason(w, m):\n    return reason_of(current_append_policy, E(w)['replay_policy'])",
     "def policy_reason(w, m):\n    return reason_of(current_append_policy, 'dedupe_by_idempotency_key')", 'refused_at', 'append_replay_policy'),
    ('C50', 'append_persisted_utc_z', "    lambda w, m: V(reason_of(date_time, E(w)['persisted_at_utc'], profile=STORAGE_UTC_Z)), gates=('env_ok',),",
     "    lambda w, m: V(reason_of(date_time, E(w)['persisted_at_utc'], profile=EVENT_RECORD)), gates=('env_ok',),", 'witness', None),
    # s4b-tokfix: the trailing-LF rule moved from the token schema (now SP-278's exact durable token) to token_full_match.
    ('C51', 'derived_token_full_match', "        if type(value) is str and re.fullmatch(pattern, value) is None:",
     "        if type(value) is str and re.search(pattern, value) is None:", 'refused_at', 'derived_token_generation_id'),
    ('C52', 'read_checkpoint_valid', "            and schema_errors(CHECKPOINTS_ID, '/$defs/' + FAM[family]['slug'] + '_index_checkpoint', value) == []\n            and checkpoint_tokens_full_match(value))",
     "            and schema_errors(CHECKPOINTS_ID, '/$defs/' + FAM[family]['slug'] + '_index_checkpoint', value) == [])", 'refused_at', 'read_token_frontier_hash'),
    ('C53', 'derived_token_full_match', "        tokens += [r.get('index_read_token') for r in retired if type(r) is dict]",
     "        pass", 'refused_at', 'derived_retired'),
    ('C54', 'read_token_checkpoint_key', "(lambda k: lambda w, m: EQ(CP(w)['index_read_token'][k], durable_token(w['store']['selection'])[k]))(_k)",
     "(lambda k: lambda w, m: EQ(CP(w)['index_read_token'][k], (CP(w)['index_read_token'] if k == 'checkpoint_key' else durable_token(w['store']['selection']))[k]))(_k)", 'witness', None),
]
MUTATIONS = [m for m in MUTATIONS if m[4] != 'skip']

HARNESS = r'''
import json, sys
sys.path.insert(0, sys.argv[1])
sys.path.insert(1, sys.argv[2])
import pm_s4b_browser_events as S
print(json.dumps(S.probe(sys.argv[3], json.loads(sys.argv[4])), default=str))
'''


def run_probe(scripts_dir, row, families):
    out = subprocess.run([sys.executable, '-B', '-c', HARNESS, str(scripts_dir), str(ROOT / 'scripts'), row,
                          json.dumps(families)], capture_output=True, text=True, timeout=3000)
    if out.returncode != 0:
        return {'error': out.stderr[-2000:]}
    return json.loads(out.stdout)


def prepare(scratch, mutation):
    d = scratch / mutation[0]
    if d.exists():
        shutil.rmtree(d)
    d.mkdir(parents=True)
    text = (ROOT / CHECKER).read_text()
    if mutation[2] not in text:
        return None, 'old_text_not_found'
    text = text.replace(mutation[2], mutation[3], 1)
    # The scratch copy reads the repository's Plans and reports, and imports its own tables before the repository's.
    text = text.replace("ROOT = Path(__file__).resolve().parents[1]", "ROOT = Path(%r)" % str(ROOT), 1)
    text = text.replace("sys.path.insert(0, str(ROOT / 'scripts'))", "sys.path.append(str(ROOT / 'scripts'))", 1)
    (d / 'pm_s4b_browser_events.py').write_text(text)
    gen = (ROOT / 'scripts/pm-s4b-table-generate.py').read_text().replace(
        "SCRIPTS = W.ROOT / 'scripts'", 'SCRIPTS = Path(__file__).resolve().parent')
    (d / 'pm-s4b-table-generate.py').write_text(gen)
    r = subprocess.run([sys.executable, '-B', str(d / 'pm-s4b-table-generate.py')], capture_output=True, text=True,
                       cwd=str(d), env={'PYTHONPATH': str(d) + ':' + str(ROOT / 'scripts'), 'PATH': '/usr/bin:/bin'})
    if r.returncode != 0:
        return None, 'generate_failed: ' + r.stderr[-500:]
    return d, None


def classify(mutation, base, mutated):
    mid, row, _o, _n, kind, extra = mutation
    if 'error' in mutated:
        return False, 'probe error: ' + mutated['error'][-300:]
    if kind == 'check':
        if extra == 'known_answers' and mutated['known_answers']:
            return True, 'known_answers: %s' % mutated['known_answers'][:2]
        if extra == 'agreement' and mutated['agreement']:
            return True, 'agreement: %d cases (first %s)' % (len(mutated['agreement']), mutated['agreement'][0])
        return False, 'stated check still passes'
    if kind == 'control':
        cid, want = extra
        got = mutated['controls'].get(cid)
        if got and got[0][0] == want and len(got) == 1:
            return True, 'control %s refused at %s' % (cid, want)
        return False, 'control %s: %s' % (cid, got)
    own = {k for k, v in base['witnesses'].items() if len(v) == 1 and v[0][0] == row}
    if not own:
        return False, 'no baseline witness'
    for k in sorted(own):
        got = mutated['witnesses'].get(k)
        if got == []:
            return True, 'witness accepted: ' + k
        if kind == 'refused_at' and got and len(got) == 1 and got[0][0] == extra:
            return True, 'witness refused at %s: %s' % (extra, k)
    return False, 'no witness of %s flipped as required (%d checked)' % (row, len(own))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--scratch', required=True)
    parser.add_argument('--json')
    parser.add_argument('--only', action='append')
    args = parser.parse_args(argv)
    scratch = Path(args.scratch)
    scratch.mkdir(parents=True, exist_ok=True)
    baselines = {}
    results = []
    for m in MUTATIONS:
        if args.only and m[0] not in args.only:
            continue
        row = m[1]
        if row not in baselines:
            baselines[row] = run_probe(ROOT / 'scripts', row, F)
        base = baselines[row]
        clean = ('error' not in base and not base['known_answers'] and not base['agreement']
                 and not any(base['controls'].values()))
        d, err = prepare(scratch, m)
        if err:
            results.append({'id': m[0], 'row': row, 'killed': False, 'why': err})
            continue
        mutated = run_probe(d, row, F)
        killed, why = classify(m, base, mutated)
        results.append({'id': m[0], 'row': row, 'kind': m[4], 'killed': killed and clean, 'why': why,
                        'baseline_clean': clean})
        print('%s %-40s %s %s' % (m[0], row, 'KILLED' if killed and clean else 'SURVIVED', why[:150]), flush=True)
    summary = {'mutations': len(results), 'killed': sum(r['killed'] for r in results), 'families': F, 'results': results}
    if args.json:
        Path(args.json).write_text(json.dumps(summary, indent=1) + '\n')
    print(json.dumps({'mutations': summary['mutations'], 'killed': summary['killed']}))
    return 0 if summary['killed'] == summary['mutations'] else 1


if __name__ == '__main__':
    sys.exit(main())
