#!/usr/bin/env python3
"""Mutation proof for the PNC-019 rv8b goal_run.replanned checker: weaken one derivation clause at a time.

Each mutation is one exact source edit (old text that occurs exactly once, its replacement) in the checker's fact
derivation, shared-call seams or retained-read selection (scripts/pm_goal_run_replan_oracles.py). The generated
table modules are proved separately by the gated guard tool. For every mutation the runner copies the checker,
its table modules and the shared modules into a scratch root beside a symlink to the real Plans/ (the repository
is never touched), applies the edit, and runs the checker with --no-corpus --outcomes in a fresh interpreter.

Kill condition (only the expected refusal counts): every declared detector case must show exactly its declared
outcome under the mutant: None (accepted) for a single-defect witness whose row the mutant deletes or weakens, or
the declared row for a copy-swap witness or for a distinct-copy control that a wrong-field mutant refuses. A crash,
a timeout or any other outcome of a detector is not a kill. Changes in other cases are recorded as collateral and
never count. The baseline (no edit) must give every detector its committed expected outcome.
Usage: python3 scripts/pm-grr-mutation-proof.py --scratch <dir> [--json <file>]
"""
import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
C = 'scripts/pm_goal_run_replan_oracles.py'
SHARED = ('pm_event_numbers.py', 'pm_event_datetime.py', 'pm_contract_formats.py', 'pm_event_index_binding.py',
          'pm_event_numbers_corpus.py', 'pm_guard_isolation.py')
POS = 'pos-blocked-continue/publish'

# (id, old, new, {detector case: expected outcome under the mutant}, what the edit does)
MUTATIONS = [
    ('M01', "        manifest_sha=files.get(SOURCE + 'manifest.json') == MANIFEST_SHA,", "        manifest_sha=True,",
     {'sr-manifest': None}, 'delete the reviewed manifest pin'),
    ('M02', "        placed_preimage=all(pre_map[p] == h for p, h in rel.items() if p in pre_map),", "        placed_preimage=True,",
     {'sr-placed-preimage': None}, 'delete the placed-member preimage check'),
    ('M03', "        digest_recorded=_ok(lambda: snapshot['digest_file'] == adoption_digest(desc)),",
     "        digest_recorded=_ok(lambda: len(snapshot['digest_file']) == 64),", {'sr-digest-file': None, 'sr-digest-frozen': None},
     'weaken the adoption digest to a well-formed hex string'),
    ('M04', "                birth_digest=b['installed_contract_digest'] == ADOPTION_DIGEST,",
     "                birth_digest=b['installed_contract_digest'] in (ADOPTION_DIGEST, FROZEN_DIGEST),", {'bi-frozen-digest': None},
     'accept the frozen digest as a birth digest (substitution)'),
    ('M05', "                birth_original=b['birth_kind'] == 'original' and b['late_enrollment'] is False,",
     "                birth_original=b['birth_kind'] == 'original',", {'bi-late-enrollment': None}, 'allow late enrollment'),
    ('M06', "        run_id=_ok(lambda: type(args['run_id']) is str and args['run_id'] != '' and args['run_id'] == e['run_id']),",
     "        run_id=_ok(lambda: type(args['run_id']) is str and args['run_id'] != ''),", {'cm-run-id-other': None}, 'drop the run join'),
    ('M07', "        sequence_integer=_ok(lambda: current_integer(args['blocked_sequence'], minimum=1) is not None),",
     "        sequence_integer=_ok(lambda: args['blocked_sequence'] >= 1),", {'cm-sequence-float': None, 'cm-sequence-bool': None},
     'bypass the shared exact-integer call (CV-1100)'),
    ('M08', "        attempt_rule=_ok(lambda: attempt_ok),", "        attempt_rule=True,", {'cm-fabricated-attempt': None},
     'allow a fabricated attempt_id (pre-attempt rule)'),
    ('M09', "        handler_installed=w['birth']['profile'] == V8 and WRITER in w['birth']['writers'],",
     "        handler_installed=WRITER in w['birth']['writers'],", {'cm-birth-v7': None}, 'accept any birth profile listing the writer name'),
    ('M10', "        action_publishable=action in PUBLISHABLE,", "        action_publishable=action in SUCCESSOR,", {'ad-cancel-action': None},
     'publish cancel through replan (C7)'),
    ('M11', "        source_status=nb['status'] in SOURCES,", "        source_status=nb['status'] != 'ready',",
     {'ad-source-certified': None, 'ad-source-failed': None, 'ad-source-cancelled': None}, 'accept terminal sources'),
    ('M12', "        revision_current=_ok(lambda: p['expected_goal_run_revision'] == nb['body_revision']),",
     "        revision_current=_ok(lambda: p['expected_goal_run_revision'] <= nb['body_revision']),", {'ad-stale-revision': None},
     'weaken the Workflow CAS to not-ahead'),
    ('M13', "        resume_fence=not (nb['status'] == 'stopped' and nb['stop_resumable'] is False) or m['changed_admission_proof'] is True,",
     "        resume_fence=True,", {'ad-unresumable-stop': None}, 'resume a resumable=false stop without changed admission'),
    ('M14', "        integers_exact=not valid or _ok(lambda: integers_exact(p)),", "        integers_exact=True,", {'pl-epoch-float': None},
     'delete the CV-1100 integer slot call'),
    ('M15', "        occurred_clock=not valid or clock(p['occurred_at_utc'], EVENT_RECORD),", "        occurred_clock=True,",
     {'pl-occurred-leap': None}, 'delete the CV-1101 occurred_at_utc call'),
    ('M16', "        generation_successor=not valid or _ok(lambda: exact(q['replan_generation'], nb['generation'] + 1)),",
     "        generation_successor=not valid or _ok(lambda: q['replan_generation'] > nb['generation']),", {'pl-generation-skip': None},
     'weaken the generation increment to monotone'),
    ('M17', "        run_revision_successor=not valid or _ok(lambda: exact(p['goal_run_revision'], p['expected_goal_run_revision'] + 1)),",
     "        run_revision_successor=not valid or _ok(lambda: p['goal_run_revision'] > p['expected_goal_run_revision']),",
     {'pl-revision-skip': None}, 'weaken the Workflow clock successor'),
    ('M18', "        goal_revision_unchanged=not valid or exact(p['goal_revision'], w['goal']['revision']),",
     "        goal_revision_unchanged=not valid or p['goal_revision'] >= w['goal']['revision'],", {'pl-goal-advanced': None},
     'allow the replan to advance the Goal revision (v2 D-CAS-01)'),
    ('M19', "        disposition_unique=not valid or (len(nodes) == len(set(nodes)) and all(n in affected for n in nodes)),",
     "        disposition_unique=not valid or all(n in affected for n in nodes),", {'pl-disposition-duplicate': None},
     'allow duplicate dispositions (bijection)'),
    ('M20', "        disposition_kind=all(d['kind'] in ('cancelled', 'resteered') and d['original'] is True for d in disp),",
     "        disposition_kind=all(d['kind'] in ('cancelled', 'resteered') for d in disp),", {'pl-disposition-candidate': None},
     'accept a candidate as an original disposition'),
    ('M21', "        history_issuers=not valid or len({hist[k]['original_phase_operation_id'] for k in ('requested', 'validated', 'applied')}) == 3,",
     "        history_issuers=True,", {'pl-history-same-op': None}, 'accept one operation issuing two graph-patch phases'),
    ('M22', "            {k: v for k, v in hist['applied']['record'].items() if k != 'status'} ==\n            {k: v for k, v in hist['validated']['record'].items() if k != 'status'}),",
     "            hist['applied']['record']['record_id'] == hist['validated']['record']['record_id']),", {'pl-applied-changed': None},
     'weaken applied-equals-validated to the record id'),
    ('M23', "        patch_affected=not valid or q['original_graph_patch']['affected_node_refs'] == affected,",
     "        patch_affected=not valid or sorted(q['original_graph_patch']['affected_node_refs']) == sorted(affected),",
     {'pl-patch-affected': None}, 'compare the graph-patch affected set as an unordered set'),
    ('M24', "        key_recipe=type(key) is str and p['idempotency_key'] == key,",
     "        key_recipe=type(p['idempotency_key']) is str and p['idempotency_key'].startswith(KEY_PREFIX),",
     {'id-key-draft': None}, 'accept any v3-prefixed key (the draft thirteen-member key)'),
    ('M25', "    return [KEY_DOMAIN, scope_partition, FAMILY, p['project_id'], p['goal_id'], p['goal_revision'],\n            p['expected_goal_run_revision'],",
     "    return [KEY_DOMAIN, scope_partition, FAMILY, p['project_id'], p['goal_id'], p['goal_revision'], p['goal_revision'],\n            p['expected_goal_run_revision'],",
     {'recipe-vector/publish': 'ID07_key_recipe'}, 'use the draft thirteen-member preimage for the canon recipe (C2); the independent recipe vector refuses'),
    ('M26', "        run_join=not env or e['run_id'] == p['payload']['goal_run_id'],", "        run_join=not env or e['run_id'] is not None,",
     {'id-run-other': None}, 'drop the outer run join'),
    ('M27', "        outer_requested_account=not env or e['requested_account_ref'] == p['requested_account_ref'],",
     "        outer_requested_account=not env or e['requested_account_ref'] == p['effective_account_ref'],",
     {POS: 'ID12_outer_requested_account', 'id-swap-outer-accounts': 'ID13_outer_effective_account'},
     'wrong-field outer account join: the distinct-copy control refuses at ID12; the swap witness moves to ID13'),
    ('M28', "        intent_requested_provider=p['requested_provider_ref'] == x['requested_provider_ref'],",
     "        intent_requested_provider=p['requested_provider_ref'] == x['effective_provider_ref'],",
     {POS: 'ID18_intent_requested_provider', 'id-swap-intent-providers': 'ID19_intent_effective_provider'},
     'wrong-field intent provider join (distinct copies)'),
    ('M29', "        intent_effective_model=p['effective_model_ref'] == x['effective_model_ref'],",
     "        intent_effective_model=p['effective_model_ref'] == x['requested_model_ref'],",
     {POS: 'ID21_intent_effective_model', 'id-intent-effective_model_ref': 'ID21_intent_effective_model'},
     'wrong-field effective model join (distinct copies)'),
    ('M30', "        intent_causation=p.get('causation_event_ref') == x['causation_event_ref'],", "        intent_causation=True,",
     {'id-intent-causation_event_ref': None}, 'drop the causation copy join'),
    ('M31', "        successor_status=na['status'] == SUCCESSOR.get(m['next_action']),", "        successor_status=na['status'] in SUCCESSOR.values(),",
     {'tr-successor': None, 'tr-cancel-successor': None}, 'accept any lifecycle successor'),
    ('M32', "        no_cancel_effect=not (na['cancel_recorded'] or na['scheduler_stop'] or na['effects_cleaned']),",
     "        no_cancel_effect=not na['cancel_recorded'],", {'tr-scheduler-stop': None, 'tr-effect-cleanup': None},
     'let a replan record SchedulerStop or effect cleanup'),
    ('M33', "        after_native='native_applied' in before,", "        after_native=True,", {'ap-before-native': None},
     'append before native application'),
    ('M34', "        receipt_numbers=not shaped or _ok(lambda: all(storage_uint64(receipt[k]) is not None for k in RECEIPT_UINT64)),",
     "        receipt_numbers=not shaped or _ok(lambda: all(receipt[k] >= 0 for k in RECEIPT_UINT64)),", {'ap-receipt-uint64-overflow': None},
     'bypass SP-1100 storage_uint64'),
    ('M35', "        ack_clock=not shaped or clock(receipt['acknowledged_at_utc'], EVENT_RECORD),",
     "        ack_clock=not shaped or clock(receipt['acknowledged_at_utc'], STORAGE_UTC_Z),", {'pos-ack-offset/publish': 'AP06_ack_clock'},
     'check acknowledged_at_utc with storage_utc_z instead of the EventRecord profile (E5-2)'),
    ('M36', "        storage_clocks=clock(e['observed_at_utc'], STORAGE_UTC_Z) and clock(e['persisted_at_utc'], STORAGE_UTC_Z),",
     "        storage_clocks=clock(e['observed_at_utc'], EVENT_RECORD) and clock(e['persisted_at_utc'], EVENT_RECORD),",
     {'ap-observed-offset': None, 'ap-persisted-lower-z': None}, 'check Storage clocks with the EventRecord profile'),
    ('M37', "        barrier_class=not shaped or receipt['durability_class'] == 'barrier',", "        barrier_class=True,", {'ap-ordinary-class': None},
     'accept an ordinary-class Replan append (SP-336)'),
    ('M38', "    encodes = _ok(lambda: storage_value_bytes(e, profile=EVENT_VALUE))", "    encodes = True",
     {'ap-epoch-4400-digits': 'AP11_custody_commitment', 'ap-epoch-uint64-overflow': 'AP11_custody_commitment'},
     'skip the SP-1100 physical encoding check'),
    ('M39', "        producer_digest=not encodes or _ok(lambda: a['custody']['producer_semantic_sha256'] == producer_semantic_digest(e)),",
     "        producer_digest=True,", {'ap-digest': None, 'ap-epoch-binary64': None}, 'delete the CV-317 producer digest check'),
    ('M40', "        phase_order=-1 not in index and index == sorted(set(index)),", "        phase_order=-1 not in index,",
     {'ap-phase-reorder': None, 'ap-phase-repeat': None}, 'accept reordered or repeated phases'),
    ('M41', "        digest_equal=not present or not timed or not keyed or _ok(lambda: stored[0]['producer_semantic_sha256'] == producer_semantic_digest(inc)),",
     "        digest_equal=True,", {'rp-conflict': None}, 'accept same key with a different digest (no idempotency_conflict)'),
    ('M42', "    stored = [s for s in r['retained'] if type(key) is str and s.get('idempotency_key') == key]\n    present = len(stored) == 1",
     "    stored = [s for s in r['retained'] if type(key) is str and s.get('idempotency_key') == key]\n    present = len(stored) >= 1",
     {'rp-two-originals': None}, 'take the first of two retained originals'),
    ('M43', "        family_listed=profile not in BRANCH or fam in BRANCH[profile],", "        family_listed=True,",
     {'rd-replan-on-v7': None, 'rd-replan-on-stop-block': None}, 'accept a replanned row on any birth (cast)'),
    ('M44', "        row_current=row['schema_version'] != V2_SCHEMA_ID and row['schema_version'].endswith('.v3'),",
     "        row_current=row['schema_version'] != V2_SCHEMA_ID,", {'rd-draft-row': None}, 'accept a draft-version row'),
    ('M45', "        gap_authenticated=not gap or covered,", "        gap_authenticated=True,", {'rd-gap': None, 'rd-gap-partial': None},
     'accept an unauthenticated revision gap'),
    ('M46', "        generation_follows=not replan or _ok(lambda: exact(row['replan_generation'], s['projected_graph_generation'] + 1)),",
     "        generation_follows=not replan or _ok(lambda: row['replan_generation'] >= s['projected_graph_generation']),",
     {'rd-generation-skip': None, 'rd-generation-repeat': None}, 'weaken the projected generation step'),
    ('M47', "        certified_from_live=fam != 'goal_run.certified' or s['projected_run_status'] in LIVE,", "        certified_from_live=True,",
     {'rd-certified-from-blocked': None, 'rd-certified-from-stopped': None}, 'certify from blocked or stopped'),
    ('M48', "        cas_before=c['cas_before_token'] == c['stored_token'],", "        cas_before=True,", {'ck-cas-stale': None},
     'drop the checkpoint CAS'),
    ('M49', "        new_generation=not row_ok or row['generation_id'] not in c['existing_generations'],", "        new_generation=True,",
     {'ck-old-generation': None}, 'write into an existing generation'),
    ('M50', "    receipts = sealed_at(w)\n    r = receipts[0] if len(receipts) == 1 else None",
     "    receipts = sealed_at(w)[:1]\n    r = receipts[0] if len(receipts) == 1 else None", {'rr-ambiguous': 'dispatcher_recipe_ambiguous'},
     'rows take the first of several sealed receipts; the shared dispatcher still refuses ambiguity (declared second line)'),
    ('M50b', ("    receipts = sealed_at(w)\n    r = receipts[0] if len(receipts) == 1 else None",
              "        if len(receipts) != 1:\n            raise Refusal('original_unavailable' if not receipts else 'recipe_ambiguous')"),
     ("    receipts = sealed_at(w)[:1]\n    r = receipts[0] if len(receipts) == 1 else None",
      "        if not receipts:\n            raise Refusal('original_unavailable')"), {'rr-ambiguous': None},
     'rows and owner both default to the first sealed receipt (recipe guess at both layers)'),
    ('M51', "    bound = r is not None and _ok(lambda: OriginalBinding(**r['binding']) == binding_of(w))",
     "    bound = r is not None and _ok(lambda: OriginalBinding(**r['binding']).project_id == binding_of(w).project_id)",
     {'rr-other-original': 'RR06_original_verified'}, 'accept a receipt of another original sharing the Project; the frozen verifier refuses (declared)'),
    ('M52', "    edition = known and _ok(lambda: RecipeTuple(**r['recipe']) == RECIPE)", "    edition = known",
     {'rr-other-edition': 'RR06_original_verified'}, 'accept another installed recipe edition; the frozen verifier refuses (declared)'),
    ('M53', "                bytes_unchanged=rd['snapshot_after'] == rd['snapshot_before'],", "                bytes_unchanged=True,",
     {'rv-bytes-changed': None}, 'drop the store snapshot comparison'),
    ('M54', "                no_receipt_created=len(rd['sealed_after']) == len(rd['sealed_before']),", "                no_receipt_created=True,",
     {'rv-receipt-created': None}, 'allow the read to create a receipt'),
    ('M55', "        authority_policy=bool(others) and all(f['retention_policy_ref'] == 'RP-AUTHORITY-INDEFINITE@1.0.0' for f in others),",
     "        authority_policy=bool(others),", {'rt-authority': None}, 'drop the authority retention binding'),
    ('M56', "        no_transient_stored=not any(f['schema_ref'].split('/')[-1] in transient for f in fams),", "        no_transient_stored=True,",
     {'rt-transient-stored': None}, 'store a transient-only union'),
    ('M57', "        no_secret_value=not any(v.startswith(SECRET_PREFIXES) or any(m in v for m in SECRET_MARKERS) for v in values),",
     "        no_secret_value=not any(any(m in v for m in SECRET_MARKERS) for v in values),", {'cu-secret-key': None},
     'miss a raw API key value'),
    ('M58', "        backup_coherent=b['seglog_record'] is True and b['receipt_custody'] is True and b['compact_families'] is True,",
     "        backup_coherent=b['seglog_record'] is True and b['receipt_custody'] is True,", {'cu-backup-no-compact': None},
     'back up the Event without the compact authority families'),
    ('M59', "        pending_from_custody=wd['pending_resolution'] in (None, 'retained_custody'),", "        pending_from_custody=True,",
     {'wd-pending-reissued': None}, 'reissue a pending replan as a new event'),
]


def run_one(scratch, mutation, timeout):
    mid, old, new, detectors, _what = mutation
    root = scratch / mid
    if root.exists():
        shutil.rmtree(root)
    (root / 'scripts').mkdir(parents=True)
    (root / 'Plans').symlink_to(ROOT / 'Plans')
    for name in SHARED + ('pm_goal_run_replan_oracles.py',):
        shutil.copy2(ROOT / 'scripts' / name, root / 'scripts' / name)
    for p in (ROOT / 'scripts').glob('pm_grr_table_*.py'):
        shutil.copy2(p, root / 'scripts' / p.name)
    if old is not None:
        target = root / C
        text = target.read_text()
        olds, news = (old, new) if type(old) is tuple else ((old,), (new,))
        for o, n in zip(olds, news):
            if text.count(o) != 1:
                return dict(id=mid, status='invalid_edit', count=text.count(o))
            text = text.replace(o, n)
        target.write_text(text)
    out = root / 'outcomes.json'
    t = time.monotonic()
    try:
        proc = subprocess.run([sys.executable, str(root / C), '--no-corpus', '--outcomes', str(out)], capture_output=True,
                              text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return dict(id=mid, status='timeout')
    got = {r['id']: r['got'] for r in json.loads(out.read_text())} if out.exists() else {}
    shutil.rmtree(root)
    return dict(id=mid, exit=proc.returncode, seconds=round(time.monotonic() - t, 1), got=got,
                stderr=proc.stderr[-400:] if not got else '')


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--scratch', type=Path, required=True)
    ap.add_argument('--json', type=Path)
    ap.add_argument('--timeout', type=int, default=300)
    args = ap.parse_args()
    args.scratch.mkdir(parents=True, exist_ok=True)
    base = run_one(args.scratch, ('BASE', None, None, {}, 'baseline'), args.timeout)
    baseline = base.get('got', {})
    expected = {}
    for mid, old, new, detectors, what in MUTATIONS:
        for case in detectors:
            expected.setdefault(case, baseline.get(case, 'missing'))
    results = [dict(id='BASE', status='baseline_pass' if base.get('exit') == 0 and baseline else 'baseline_fail')]
    for m in MUTATIONS:
        mid, old, new, detectors, what = m
        r = run_one(args.scratch, m, args.timeout)
        got = r.get('got', {})
        observed = {case: got.get(case, 'missing') for case in detectors}
        killed = bool(got) and all(observed[c] == want for c, want in detectors.items())
        collateral = sorted(c for c in got if c not in detectors and got[c] != baseline.get(c))
        results.append(dict(id=mid, what=what, status='killed' if killed else r.get('status', 'survived'),
                            detectors={c: dict(baseline=baseline.get(c), want=w, got=observed[c]) for c, w in detectors.items()},
                            collateral=len(collateral), collateral_sample=collateral[:6], seconds=r.get('seconds')))
        print(mid, results[-1]['status'], file=sys.stderr, flush=True)
    killed = sum(1 for r in results[1:] if r['status'] == 'killed')
    ok = results[0]['status'] == 'baseline_pass' and killed == len(MUTATIONS)
    report = {'status': 'pass' if ok else 'fail', 'mutants': len(MUTATIONS), 'killed': killed,
              'kill_condition': 'every declared detector shows exactly its declared outcome; nothing else counts',
              'results': results}
    if args.json:
        args.json.write_text(json.dumps(report, indent=1, sort_keys=True) + '\n')
    print(json.dumps({'status': report['status'], 'mutants': len(MUTATIONS), 'killed': killed,
                      'not_killed': [r['id'] for r in results[1:] if r['status'] != 'killed']}))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
