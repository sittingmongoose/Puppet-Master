"""Source-only S8 binding checks. No ledger import, mutation or native launch."""
import copy
import hashlib
import json
import math
from pathlib import Path
import time

HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
DEADLINE = 1791013030.8303788
START = 1790905209
CAPS = {'stage_caps': [1200, 1200, 900], 'case_wall': 3600,
        'case_occupied': 5400, 'outside_native': 300, 'responses': 160}
DECLARATION = LAB / 'dev/attempt-successor-declarations-v1/DECLARATION_CLOSURE.json'
PATCH = DECLARATION.parent / 'ROOT_RELEASE_PATCH.json'
V7 = LAB / 'ops/execution-resume-v1/root-production-release-v7.json'
REVIEW = LAB / 'ops/attempt-reservation-review-v1/REVIEW.json'
QUIET = LAB / 'ops/recovery-v1/ATTEMPT_V7_QUIET_V1.json'
ACCEPTANCE = LAB / 'ops/recovery-v1/OUTPUT_GUARD_CONTROL_BINDING_ACCEPTANCE_V1.json'
BINDING_REVIEW = LAB / 'ops/output-guard-binding-review-v1/REVIEW.json'
GUARD_AUTHORITY = LAB / 'ops/recovery-v1/OUTPUT_GUARD_ROOT_AUTHORITY_V1.json'
GUARD_ACCEPTANCE = LAB / 'ops/recovery-v1/OUTPUT_GUARD_SOURCE_ACCEPTANCE_V1.json'
GUARD_INSTALL = LAB / 'ops/recovery-v1/OUTPUT_GUARD_INSTALL_RECEIPT_V1.json'
GUARD_SOURCE = LAB / 'ops/output-guard-api-v1/ledger_output_guard_v1.py'
GUARD_MANIFEST = GUARD_SOURCE.parent / 'MANIFEST.json'
GUARD_REVIEW = LAB / 'ops/output-guard-review-v1/REVIEW.json'
GUARD_RECEIPT_KEY = 'output_guard_authority_v1'


def require(ok, message):
    if not ok:
        raise ValueError('HOLD: ' + message)


def regular(path):
    p = Path(path)
    require(p.is_absolute() and '..' not in p.parts
            and not any(q.is_symlink() for q in (p, *p.parents)) and p.is_file(),
            'canonical positive file required')
    return p


def sha(path):
    return hashlib.sha256(regular(path).read_bytes()).hexdigest()


def read(path):
    p = regular(path)
    require(p.stat().st_size <= 4 * 1024 * 1024, 'bounded metadata required')
    def unique(items):
        d = {}
        for k, v in items:
            require(k not in d, 'duplicate JSON key')
            d[k] = v
        return d
    def nonfinite(value):
        raise ValueError('HOLD: nonfinite JSON')
    value = json.loads(p.read_text(), object_pairs_hook=unique, parse_constant=nonfinite)
    require(type(value) is dict, 'metadata object required')
    return value


def finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def ref(path):
    return {'path': str(path), 'sha256': sha(path)}


def record(value, path):
    require(type(value) is dict and set(value) == {'path', 'sha256'}
            and value == ref(path), 'exact metadata reference required')
    return read(path)


def dependencies():
    pins = read(HERE / 'DEPENDENCIES.json')['positive_scoped_dependencies']
    for path, digest in pins.items():
        require(sha(path) == digest, 'scoped immutable dependency drift: ' + path)
    return pins


def source_interface(pair_ids):
    """Pure generator: returns unaccepted interface data, never a release."""
    dependencies()
    closure = read(DECLARATION)
    patch = read(PATCH)['fields_for_new_root_release_after_independent_acceptance']
    review = read(REVIEW)
    v7 = read(V7)
    require(review.get('accepted') is True and review.get('independent') is True
            and review.get('declarations_accepted') is True
            and review.get('declaration_closure') == ref(DECLARATION),
            'accepted exact reservation/declaration review required')
    require(closure.get('caps') == CAPS and closure.get('original_start_epoch') == START
            and closure.get('campaign_deadline_epoch') == DEADLINE,
            'original caps/clock required')
    all_pairs = {p['logical_pair_id']: p for p in closure['pairs']}
    require(type(pair_ids) is list and 1 <= len(pair_ids) <= 6
            and all(type(p) is str for p in pair_ids)
            and len(set(pair_ids)) == len(pair_ids)
            and set(pair_ids) <= set(all_pairs), 'nonempty unique whole-pair subset required')
    # Stable closure order, independent of command-line ordering.
    pairs = [p for p in closure['pairs'] if p['logical_pair_id'] in pair_ids]
    cases = [a['new_attempt_case_id'] for p in pairs for a in p['arms']]
    jobs = [j for p in pairs for a in p['arms'] for j in a['new_jobs']]
    require(not set(cases).intersection(v7['case_queue']), 'V7 scheduled case excluded')
    for p in pairs:
        b = p['common_binding']
        require(b['route'] == v7['route'] and b['pins'] == v7['pins']
                and b['account'] == 'existing-authorized-zcode-account-v8-A'
                and b['model'] == 'GLM5.3FlashMax', 'same Z native identity required')
        require([a['arm'] for a in p['arms']] == ['control', 'treatment'], 'whole contrast required')
    fields = {'case_queue': cases, 'allowed_jobs': jobs,
              'case_sources': {c: copy.deepcopy(patch['case_sources'][c]) for c in cases},
              # Keep unchanged old control planning_map pin plus all declared protocol pins.
              'planning_input_sha256': copy.deepcopy(patch['planning_input_sha256']),
              'production_entry': str(HERE / 'integrated-controller/rolling.py'),
              'resume_ledger': read(HERE / 'recovery-control.json')['ledger'],
              'predecessor_release': ref(V7), 'predecessor_release_preserved': True,
              'controller_snapshot': ref(HERE / 'integrated-controller/SOURCE_FREEZE.json'),
              'max_component_seconds': 1200, 'max_component_responses': 160,
              'outside_native_cap_seconds': 300}
    return {'schema': 'pm.er8.attempt-control-binding-interface.v1',
            'accepted': False, 'root_authority': False, 'source_only': True,
            'declaration_closure': ref(DECLARATION), 'predecessor_release': ref(V7),
            'selected_pair_ids': [p['logical_pair_id'] for p in pairs],
            'pairs': copy.deepcopy(pairs),
            'fields_for_root_release_after_separate_acceptance': fields,
            'not_a_resource_fit_or_native_authorization': True}


def validate_release(release, now=None):
    """Gate reused controller; actual root receipts are supplied only later."""
    now = time.time() if now is None else now
    require(finite(now) and START <= now < DEADLINE, 'finite original campaign window required')
    binding = release.get('attempt_control_binding')
    require(type(binding) is dict and set(binding) == {
        'pair_ids', 'declaration_closure', 'predecessor_release', 'source_acceptance',
        'v7_quiet', 'reservation_receipt_id'}, 'exact S8 root binding required')
    interface = source_interface(binding['pair_ids'])
    expected = interface['fields_for_root_release_after_separate_acceptance']
    for k, value in expected.items():
        require(release.get(k) == value, 'root subset/control field mismatch: ' + k)
    require(binding['declaration_closure'] == interface['declaration_closure']
            and binding['predecessor_release'] == interface['predecessor_release'], 'original lineage pins required')
    v7 = read(V7)
    for k in ('route', 'pins', 'config', 'route_snapshot', 'execution_snapshot',
              'route_acceptance', 'execution_acceptance', 'caller_acceptance',
              'caller_source_freeze', 'source_freeze', 'authorization', 'authority_amendment',
              'canary_review', 'operator_monitor', 'operator_monitor_acceptance', 'capture_binding'):
        require(release.get(k) == v7.get(k), 'unchanged accepted route boundary required: ' + k)
    require(release.get('campaign_start_epoch') == START
            and release.get('campaign_deadline_epoch') == DEADLINE
            and release.get('max_component_seconds') == 1200
            and release.get('max_component_responses') == 160
            and release.get('outside_native_cap_seconds') == 300,
            'original campaign/stage envelope required')
    selected = release.get('selected_positive_files')
    require(type(selected) is dict, 'positive source inventory required')
    for path, digest in read(HERE / 'integrated-controller/SOURCE_FREEZE.json')['closure_sha256'].items():
        require(selected.get(path) == digest, 'full controller closure required')
    accepted = record(binding['source_acceptance'], ACCEPTANCE)
    require(accepted.get('schema') == 'pm.er8.output-guard-control-binding-root-acceptance.v1'
            and accepted.get('root_authority') is True and accepted.get('accepted') is True
            and accepted.get('controller_snapshot') == expected['controller_snapshot']
            and accepted.get('control') == ref(HERE / 'recovery-control.json')
            and finite(accepted.get('accepted_epoch')) and START <= accepted['accepted_epoch'] <= now,
            'separate root binding acceptance required')
    review = record(accepted.get('independent_review'), BINDING_REVIEW)
    require(review.get('schema') == 'pm.er8.output-guard-control-binding-independent-review.v1'
            and review.get('independent') is True and review.get('accepted') is True
            and review.get('controller_snapshot') == expected['controller_snapshot']
            and review.get('control') == accepted['control'], 'separate accepted independent binder review required')
    require(release.get('controller_acceptance') == accepted['independent_review'], 'new controller review pin required')
    quiet = record(binding['v7_quiet'], QUIET)
    require(quiet.get('schema') == 'pm.er8.attempt-v7-quiet.v1'
            and quiet.get('root_authority') is True
            and quiet.get('predecessor_release') == interface['predecessor_release']
            and finite(quiet.get('observed_epoch')) and START <= quiet['observed_epoch'] <= now
            and all(quiet.get(k) is True for k in ('scheduler_absent', 'native_quiescent',
                'parents_absent', 'actors_absent', 'permits_settled')),
            'positive whole V7 scheduler/native/parent/actor/permit quiet required')
    require(type(binding['reservation_receipt_id']) is str and binding['reservation_receipt_id'],
            'exact already-appended reservation receipt identity required')
    validate_output_guard_release(release, now)
    return interface


def validate_ledger_binding(release, state):
    """Inspect only state already held by inherited controller transaction."""
    proof = validate_output_guard_release(release)
    require(state.get(GUARD_RECEIPT_KEY) == proof['receipt'], 'exact actually installed output guard receipt required')
    binding = release['attempt_control_binding']
    interface = source_interface(binding['pair_ids'])
    receipt = state.get('attempt_reservation_receipts', {}).get(binding['reservation_receipt_id'], {})
    request = receipt.get('request', {})
    require(receipt.get('schema') == 'pm.er8.attempt-reservation-receipt.v1'
            and request.get('receipt_id') == binding['reservation_receipt_id']
            and request.get('root_authority') is True
            and request.get('pairs') == interface['pairs']
            and request.get('declaration_closure') == binding['declaration_closure']
            and request.get('predecessor_release') == binding['predecessor_release']
            and request.get('caps') == CAPS
            and receipt.get('no_old_commitment_retirement') is True
            and finite(receipt.get('recorded_epoch')) and START <= receipt['recorded_epoch'] < DEADLINE
            and finite(receipt.get('native_starts_with_commitments'))
            and receipt['native_starts_with_commitments'] <= 144
            and finite(receipt.get('occupied_seconds_with_commitments'))
            and receipt['occupied_seconds_with_commitments'] <= 172800,
            'exact successful root append receipt/all old commitments required')
    for pair in interface['pairs']:
        for arm in pair['arms']:
            case = arm['new_attempt_case_id']
            installed = proof['receipt']
            require(case not in installed['preinstall_case_ids']
                    and not set(arm['new_jobs']).intersection(installed['preinstall_job_ids']),
                    'old born identities cannot enter future guard binding')
            if case in state.get('cases', {}):
                birth = state['cases'][case].get('birth_epoch')
                require(finite(birth) and birth >= installed['effective_epoch'], 'selected case born before guard installation')
            for job in arm['new_jobs']:
                if job in state.get('jobs', {}):
                    birth = state['jobs'][job].get('birth_epoch')
                    require(finite(birth) and birth >= installed['effective_epoch'], 'selected job born before guard installation')
            row = state.get('attempt_lineage_by_case', {}).get(case, {})
            require(all(row.get(k) == v for k, v in arm.items())
                    and row.get('attempt_pair_id') == pair['attempt_pair_id']
                    and row.get('common_binding') == pair['common_binding']
                    and row.get('caps') == CAPS
                    and row.get('reservation_receipt_id') == binding['reservation_receipt_id'],
                    'exact selected appended arm lineage required')
            promise = state['reservation_by_case'].get(case, {})
            require(promise.get('native_starts') == 3 and promise.get('occupied_seconds') == 5400
                    and promise.get('final_job') == arm['new_final_job'], 'literal selected promise required')


def canonical_sha(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def validate_output_guard_release(release, now=None):
    """Metadata-only preflight; installed state is compared separately while held."""
    now = time.time() if now is None else now
    require(finite(now) and START <= now < DEADLINE, 'finite original output guard campaign window required')
    binding = release.get('output_guard_binding')
    require(type(binding) is dict and set(binding) == {'authority', 'source_acceptance', 'install_receipt'},
            'exact output guard release binding required')
    require(binding['authority'] == ref(GUARD_AUTHORITY), 'exact guard root authority required')
    authority = record(binding['authority'], GUARD_AUTHORITY)
    require(authority.get('root_authority') is True and authority.get('new_warning') == 1200000
            and authority.get('new_stop') == 2000000, 'reviewed finite prospective guard selection required')
    accepted = record(binding['source_acceptance'], GUARD_ACCEPTANCE)
    require(accepted.get('schema') == 'pm.er8.output-guard-source-acceptance.v1'
            and accepted.get('accepted') is True and accepted.get('root_authority') is True
            and accepted.get('independent_source_review_accepted') is True
            and accepted.get('authority') == binding['authority']
            and accepted.get('source') == ref(GUARD_SOURCE)
            and accepted.get('source_manifest') == ref(GUARD_MANIFEST)
            and finite(accepted.get('accepted_epoch')) and START <= accepted['accepted_epoch'] <= now,
            'exact independent/root guard source acceptance required')
    review = record(accepted.get('independent_review'), GUARD_REVIEW)
    require(review.get('schema') == 'pm.er8.output-guard-independent-review.v1'
            and review.get('independent') is True and review.get('accepted') is True
            and review.get('source') == accepted['source'] and review.get('source_manifest') == accepted['source_manifest']
            and review.get('authority') == binding['authority'], 'exact independent guard review required')
    proof = record(binding['install_receipt'], GUARD_INSTALL)
    receipt = proof.get('receipt', {})
    require(proof.get('schema') == 'pm.er8.output-guard-install-proof.v1' and proof.get('root_authority') is True
            and proof.get('campaign_id') == LAB.name and proof.get('receipt_key') == GUARD_RECEIPT_KEY
            and proof.get('receipt_sha256') == canonical_sha(receipt)
            and receipt.get('schema') == 'pm.er8.output-guard-install-receipt.v1'
            and receipt.get('root_authority') is True and receipt.get('authority') == binding['authority']
            and receipt.get('source_acceptance') == binding['source_acceptance']
            and receipt.get('warning') == 1200000 and receipt.get('stop') == 2000000
            and receipt.get('version') == 'prospective-output-guard-v1'
            and finite(receipt.get('effective_epoch')) and accepted['accepted_epoch'] <= receipt['effective_epoch'] <= now
            and receipt['effective_epoch'] < DEADLINE,
            'exact actual once-only guard installation proof required')
    for key in ('preinstall_case_ids', 'preinstall_job_ids'):
        ids = receipt.get(key)
        require(type(ids) is list and all(type(x) is str for x in ids) and ids == sorted(set(ids)),
                'immutable original identity sets required')
    return proof


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pair', action='append', required=True)
    args = parser.parse_args()
    print(json.dumps(source_interface(args.pair), indent=2, allow_nan=False))
