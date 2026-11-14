#!/usr/bin/env python3
"""S6 real-edition negatives and bounded Method B custody proofs.

Run under long-job and the lane's memory-capped scope. Scratch is external and
empty; each mutation has an exact expected refusal, never 'any failure kills'.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pm_guard_isolation as g
import pm_event_token_custody as custody
import pm_event_token_reconstruction as reconstruction

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / 'scripts/pm-event-token-dispositions.py'


def load_tool():
    spec = importlib.util.spec_from_file_location('pm_s6_classifier_checks', TOOL)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--edition', type=Path, required=True)
    parser.add_argument('--readiness', type=Path, action='append', default=[])
    parser.add_argument('--scratch', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    scratch, report, edition = args.scratch.resolve(), args.report.resolve(), args.edition.resolve(strict=True)
    if scratch.is_relative_to(ROOT) or scratch == edition or edition.is_relative_to(scratch) or scratch.is_relative_to(edition):
        parser.error('scratch must be external and disjoint from edition and repository')
    if scratch.exists() and any(scratch.iterdir()):
        parser.error('scratch must be empty')
    scratch.mkdir(parents=True, exist_ok=True)
    report.mkdir(parents=True, exist_ok=True)
    m = load_tool()
    cases = []

    def record(name, passed, **details):
        cases.append(dict(name=name, pass_=passed, **details))
        print(json.dumps(cases[-1]), flush=True)

    def cli(command, selected_edition, out):
        cmd = [sys.executable, str(TOOL), command, '--root', str(ROOT), '--edition', str(selected_edition), '--outdir', str(out)]
        for path in args.readiness:
            cmd += ['--readiness', str(path.resolve())]
        cp = subprocess.run(cmd, capture_output=True, text=True)
        try:
            result = json.loads(cp.stdout)
        except ValueError:
            result = {'error': 'UNPARSEABLE_STDOUT', 'stdout': cp.stdout[-1500:]}
        return cp.returncode, result, cp.stderr[-1500:]

    baseline = scratch / 'baseline'
    code, result, stderr = cli('classify', edition, baseline)
    record('real_edition_positive', code == 0 and result.get('classification_valid') is True,
           exit=code, result=result, stderr=stderr)
    if code:
        (report / 'results.json').write_text(json.dumps(cases, indent=2) + '\n')
        return 1
    code, result, stderr = cli('validate', edition, baseline)
    record('real_bundle_reconstruction_positive', code == 0 and result.get('classification_valid') is True,
           exit=code, result=result, stderr=stderr)
    rows = [json.loads(x) for x in (baseline / 'TOKEN_DISPOSITIONS.jsonl').read_text().splitlines()]
    by_token = {x['exact_token']: x for x in rows}
    summary = json.loads((baseline / 'SUMMARY.json').read_text())
    record('exact_one_row_and_source_per_token', len(by_token) == len(rows) == summary['tokens']
           and all(x['source_rows'] and x['class'] == x['rule_id'] and isinstance(x['disposition'], str) for x in rows)
           and set(x['rule_id'] for x in rows) <= {name for name, _ in m.RULES})
    record('pending_and_judgement_separate', summary['counts_by_resolution_state']['pending'] > 0
           and len(summary['residue_tokens']) == summary['judgement_residue']
           and not any(x['resolution_state'] == 'pending' and x['exact_token'] in summary['residue_tokens'] for x in rows))
    record('closure_claims_false', all(summary[k] is False for k in ('event_authority_closed', 'complete_denominator_known', 'contract_depth_complete', 'build_or_pnc019_authority')))
    # Real source anchors, not a reimplementation of the selection algorithm.
    for token, expected in {
        'context.compaction.completed': 'registered',
        'coordination.agent_registered': 'registered',
        'subagent.cancel_requested': 'landed_exclusion',
        'browser.session.navigated': 'judgement_residue',
        'memory.gist.updated': 'judgement_residue',
        # Lane s6r supplement (census-adjudication/S6R-NEW-NAMES-LEDGER.jsonl):
        # binding identifiers and retired spellings leave the residue; the
        # contingency names and the nine pending parent-merge rows stay in it.
        'owner.debug.investigation.started': 'landed_exclusion',
        'emitter.wizard_opened': 'landed_exclusion',
        'forge.review.merged.publish': 'landed_exclusion',
        'chat_run.cancelled': 'landed_exclusion',
        'config.validation.passed': 'judgement_residue',
        'testing.receipt.recorded': 'judgement_residue',
        'cmd.browser.workspace.create': 'command_namespace',
    }.items():
        actual = by_token.get(token, {}).get('class')
        record('real_source_anchor/' + token, actual == expected, expected=expected, actual=actual)

    # Method B gets the exact predicates invoked by require_case. The controls
    # below are extracted equality-boundary values, not full CLI inputs.
    h = hashlib.sha256((edition / 'EVENT_OCCURRENCES.jsonl').read_bytes()).hexdigest()
    good = {'validator_hash': 'validator-sha256', 'receipt_validator_hash': 'validator-sha256',
            'artifact_hashes': {'EVENT_OCCURRENCES.jsonl': h}, 'receipt_artifact_hashes': {'EVENT_OCCURRENCES.jsonl': h},
            'source_paths': ['Plans/storage-plan.md'], 'inventory_source_paths': ['Plans/storage-plan.md'],
            'source_hashes': {'Plans/storage-plan.md': [123, 'source-sha256']},
            'inventory_source_hashes': {'Plans/storage-plan.md': [123, 'source-sha256']},
            'source_manifest_hash': 'manifest-sha256', 'inventory_manifest_hash': 'manifest-sha256'}
    pairs = [('validator', 'validator_hash'), ('artifacts', 'artifact_hashes'), ('source_set', 'source_paths'),
             ('source_bytes', 'source_hashes'), ('manifest', 'source_manifest_hash')]
    for name, factory, value, mutations, module_path, function in [
        ('custody', custody.custody_case, good, pairs, 'scripts/pm_event_token_custody.py', 'custody_case'),
        ('reconstruction', reconstruction.occurrence_case,
         {'occurrences_sha256': h, 'reconstructed_occurrences_sha256': h},
         [('occurrences', 'occurrences_sha256')], 'scripts/pm_event_token_reconstruction.py', 'occurrence_case'),
    ]:
        negatives = []
        for guard, key in mutations:
            bad = copy.deepcopy(value)
            bad[key] = 'different-observed-value'
            negatives.append(g.Negative(guard, bad, guard, factory().table.guards[guard].refusal_code,
                                        'valid', 'Change only the observed ' + key))
        declarations = [g.NonGuard(module_path, function, 'return', 'return g.Case(table, check)',
                                    'Return a fresh engine Case; this constructor decides no input predicate.')]
        suite = g.Suite('S6 bounded ' + name, factory, [g.Control('valid', value, 'synthetic')], negatives,
                        (ROOT / module_path,), ROOT, non_guards=declarations)
        proof = g.run(suite)
        (report / ('guards-' + name + '.json')).write_text(json.dumps(proof, indent=2) + '\n')
        (report / ('guards-' + name + '.md')).write_text(g.markdown(proof))
        record('method_b/' + name, proof['status'] == 'PASS' and not proof['unproved_guards'],
               status=proof['status'], guards=len(proof['inventory']), unproved=proof['unproved_guards'], failures=proof['failures'])

    def repin(folder, filename):
        p = folder / 'VALIDATOR_RECEIPT.json'
        doc = json.loads(p.read_text())
        doc['artifact_hashes'][m.AUDIT + '/' + filename] = m.sha((folder / filename).read_bytes())
        p.write_text(json.dumps(doc))

    def save(folder, name, doc, pin=True):
        (folder / name).write_text(json.dumps(doc))
        if pin:
            repin(folder, name)

    # Mutate one real artifact/binding at a time. These are complete CLI calls.
    for kind, expected in [
        ('validator_hash', 'edition_validator_drift'),
        ('artifact_bytes', 'edition_artifact_drift'),
        ('source_omission', 'edition_source_set_drift'),
        ('source_hash', 'edition_source_bytes_drift'),
        ('manifest_hash', 'edition_manifest_drift'),
        ('rehashed_occurrence_omission', 'edition_occurrence_mismatch'),
        ('status_count', 'edition status census count mismatch'),
        ('failed_producer_receipt', 'invalid edition identity or failed producer receipt'),
    ]:
        folder = scratch / kind
        shutil.copytree(edition, folder)
        if kind == 'validator_hash':
            doc = json.loads((folder / 'VALIDATOR_RECEIPT.json').read_text()); doc['validator_sha256'] = '0' * 64
            save(folder, 'VALIDATOR_RECEIPT.json', doc, pin=False)
        elif kind == 'failed_producer_receipt':
            doc = json.loads((folder / 'VALIDATOR_RECEIPT.json').read_text()); doc['evidence_valid'] = False
            save(folder, 'VALIDATOR_RECEIPT.json', doc, pin=False)
        elif kind in ('artifact_bytes', 'rehashed_occurrence_omission'):
            p = folder / 'EVENT_OCCURRENCES.jsonl'; p.write_bytes(p.read_bytes().split(b'\n', 1)[1])
            if kind == 'rehashed_occurrence_omission':
                repin(folder, p.name)
        elif kind == 'status_count':
            doc = json.loads((folder / 'EVENT_FAMILY_DENOMINATOR_STATUS.json').read_text())
            doc['live_mechanical_census']['unique_tokens'] += 1
            save(folder, 'EVENT_FAMILY_DENOMINATOR_STATUS.json', doc)
        else:
            doc = json.loads((folder / 'CURRENT_EVENT_SOURCE_INVENTORY.json').read_text())
            if kind == 'source_omission':
                doc['sources'].pop()
                doc['sources_sha256'] = m.sha(m.canonical(doc['sources']))
            elif kind == 'source_hash':
                doc['sources'][0]['sha256'] = '0' * 64
                doc['sources_sha256'] = m.sha(m.canonical(doc['sources']))
            else:
                doc['sources_sha256'] = '0' * 64
            save(folder, 'CURRENT_EVENT_SOURCE_INVENTORY.json', doc)
        code, result, stderr = cli('classify', folder, scratch / ('output-' + kind))
        killed = code == 2 and result.get('error') == expected and result.get('classification_valid') is False
        record('real_edition_mutation/' + kind, killed, expected=expected, exit=code, result=result, stderr=stderr)
        shutil.rmtree(folder)

    # Tampering with a result AND any stored counts cannot bless a different
    # decision: validate derives its expected output again from live authority.
    for name, artifact, mutate in [
        ('promote_pending', 'TOKEN_DISPOSITIONS.jsonl', lambda raw: raw.replace(b'PENDING_RECOUNT_OUTCOME', b'REGISTERED_MEMBERSHIP_OBSERVED', 1)),
        ('duplicate_token', 'TOKEN_DISPOSITIONS.jsonl', lambda raw: raw + raw.split(b'\n', 1)[0] + b'\n'),
        ('drop_residue', 'RESIDUE.jsonl', lambda raw: b''),
        ('claim_closed', 'SUMMARY.json', lambda raw: raw.replace(b'"event_authority_closed": false', b'"event_authority_closed": true')),
    ]:
        path = baseline / artifact; original = path.read_bytes(); path.write_bytes(mutate(original))
        try:
            code, result, stderr = cli('validate', edition, baseline)
            expected = 'classifier output differs from current reclassification: ' + artifact
            record('real_output_mutation/' + name, code == 2 and result.get('error') == expected,
                   expected=expected, exit=code, result=result, stderr=stderr)
        finally:
            path.write_bytes(original)

    # Parser failures are explicit refusals, not proof credit for a crash.
    for label, raw in [('duplicate_key', '{"a":1,"a":2}'), ('non_finite_constant', '{"a":NaN}'), ('non_finite_float', '{"a":1e999}')]:
        try:
            m.unique_json(raw)
        except m.InputError as exc:
            record('parser/' + label, True, error=str(exc))
        else:
            record('parser/' + label, False)
    passed = all(x['pass_'] for x in cases)
    outcome = {'status': 'PASS' if passed else 'FAIL', 'cases': len(cases),
               'passed': sum(x['pass_'] for x in cases), 'failed': [x['name'] for x in cases if not x['pass_']],
               'mutation_kills': sum(x['pass_'] for x in cases if 'mutation/' in x['name']),
               'mutation_cases': sum('mutation/' in x['name'] for x in cases),
               'boundary': 'Six actual equality guards only; classifier/IO do not inherit Method B credit. No blind sample or independent review claimed.',
               'results': cases}
    (report / 'results.json').write_text(json.dumps(outcome, indent=2) + '\n')
    print(json.dumps({k: v for k, v in outcome.items() if k != 'results'}), flush=True)
    shutil.rmtree(scratch)
    return 0 if passed else 1


if __name__ == '__main__':
    raise SystemExit(main())
