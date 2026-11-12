#!/usr/bin/env python3
"""Build the DF sweep part 2A/2B witnesses and the SP-1101 custody catalogue.

Usage: python3 scripts/pm-filesafe-p2a-cases.py [--write | --check] [--only ROW]...

1. Custody catalogue: every positive bank of Plans/filesafe_event_authority_fixtures.json
   gets original_custody: for each issued original and each original source, the
   write-time edition (DF-prepared-v2) and the SHA-256 manifest of the frozen resources
   at this head. Nothing else in the fixture changes.
2. Witnesses: Plans/filesafe_event_p2a_cases.json, one coherent single-defect negative
   (or trace) per guard row the earlier fixtures leave without one. Each is built from
   a named valid seed of its own family; every copy that is not the defect moves with it.
   A case is kept only when the complete checker refuses it with its target row as the
   first refusal (pm_filesafe_p2a_cases.first_refusal); the rest are printed.
--check exits 1 when either file is stale or a kept case no longer hits its row.
"""
import argparse
import copy
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_filesafe_event_authority as A  # noqa: E402
import pm_filesafe_event_contracts as C  # noqa: E402
import pm_filesafe_p2a_cases as P  # noqa: E402
from pm_projects_refresh_contracts import semantic_hash  # noqa: E402
from pm_event_numbers import APP_PHYSICAL, storage_value_bytes  # noqa: E402

FIXTURE = ROOT / 'Plans/filesafe_event_authority_fixtures.json'
EDITION = 'DF-prepared-v2'


def dump(value):
    return json.dumps(value, indent=2, ensure_ascii=False) + '\n'


# ----------------------------------------------------------------- custody catalogue
def with_custody(pack):
    pack = copy.deepcopy(pack)
    for row in pack['families']:
        manifest = A.resource_manifest(row['event_type'])
        for case in row['positive']:
            bank = case['bank']
            refs = list(bank['issued']) + [r for r in bank['sources'] if r not in bank['issued']]
            bank['original_custody'] = {ref: {'write_time_edition': EDITION, 'resource_manifest_sha256': manifest}
                                        for ref in refs}
    return pack


# ----------------------------------------------------------------- coherent rebuild
def encode_body(value, codec):
    if codec == 'RFC8785':
        from pm_event_numbers import qualified_jcs
        return qualified_jcs(value)
    if codec == APP_PHYSICAL:
        return storage_value_bytes(value, profile=APP_PHYSICAL)
    raise ValueError(codec)


def rebuild(family, candidate, bank, keep=()):
    """Move every copy of a changed fact except the defect named in keep."""
    graph = A.context(family)[0]
    source, event, custody = candidate['source'], candidate['event'], candidate['custody']
    req = source['original_request']
    members = {m['role']: m for m in source['body_members']}
    if 'payload' not in keep and event['payload_ref'] is None:
        event['payload'] = copy.deepcopy(source['original_result'])
    if 'application_bodies' not in keep and req['scope']['scope_kind'] == 'application' and family.startswith('safe_point.'):
        for role in graph['application_body_roots']:
            if role in keep or role not in members:
                continue
            if role.endswith('request'):
                value = {k: v for k, v in req.items() if k not in ('original_input_ref', 'original_input_sha256')}
            else:
                value = source['application_records'][role]
            raw = encode_body(value, graph['application_body_codecs'][role])
            bank['bodies'][members[role]['ref']] = raw.hex()
            if 'member_sha:' + role not in keep:
                members[role]['sha256'] = hashlib.sha256(raw).hexdigest()
                if req['original_input_ref'] == members[role]['ref']:
                    # The request body is also the original input; its digest is an addressing field.
                    req['original_input_sha256'] = members[role]['sha256']
    if 'native_project_record' in source and 'native_body' not in keep:
        role = members[graph['original_project_body_role']]
        raw = A.storage_owner().canonical_messagepack_bytes(source['native_project_record'])
        bank['bodies'][role['ref']] = raw.hex()
        role['sha256'] = hashlib.sha256(raw).hexdigest()
    if 'source_commitment' not in keep:
        source['accepted_source_sha256'] = A.source_commitment(source)
    if 'bank_source' not in keep:
        bank['sources'][source['source_ref']] = copy.deepcopy(source)
    if family == 'safe_point.created' and 'bank_manifest' not in keep:
        p = source['original_result']
        fields = ('worktree_id', 'worktree_path', 'branch_name', 'HEAD_sha', 'snapshot_manifest_ref',
                  'snapshot_manifest_sha256', 'content_state_sha256')
        bank['manifests'][source['source_ref']] = {k: p.get(k) for k in fields}
    if 'custody_digests' not in keep:
        custody['producer_semantic_digest'] = A.producer_semantic_digest(event)
        custody['original_event_value_commitment']['sha256'] = A.full_commitment(event)
    if 'issued' not in keep:
        bank['issued'][event['event_id']] = {'event': copy.deepcopy(event), 'custody': copy.deepcopy(custody)}
        if 'boundary' not in keep:
            bank['retained_boundary'][event['event_id']] = {'event': copy.deepcopy(event), 'custody': copy.deepcopy(custody)}
    return candidate, bank


def edits_between(seed, result, target):
    """Edits that turn seed into result: whole top-level members, bank maps per key."""
    edits = []
    for key in sorted(set(seed) | set(result)):
        if key not in result:
            edits.append(dict(target=target, path='/' + key, remove=True))
        elif key not in seed:
            edits.append(dict(target=target, path='/' + key, value=result[key]))
        elif seed[key] != result[key] or type(seed[key]) is not type(result[key]) or json.dumps(seed[key]) != json.dumps(result[key]):
            if target == 'bank' and isinstance(seed[key], dict) and isinstance(result[key], dict) and all('/' not in k for k in set(seed[key]) | set(result[key])):
                for sub in sorted(set(seed[key]) | set(result[key])):
                    if sub not in result[key]:
                        edits.append(dict(target=target, path=f'/{key}/{sub}', remove=True))
                    elif sub not in seed[key] or json.dumps(seed[key][sub]) != json.dumps(result[key][sub]):
                        edits.append(dict(target=target, path=f'/{key}/{sub}', value=result[key][sub]))
            else:
                edits.append(dict(target=target, path='/' + key, value=result[key]))
    return edits


def materialize_case(family, index, row, change, keep=(), kind='materialization', expected=None, note=''):
    base = P.seed(family, index)
    candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
    change(candidate, bank)
    rebuild(family, candidate, bank, keep)
    edits = edits_between(base['candidate'], candidate, 'candidate') + edits_between(base['bank'], bank, 'bank')
    return dict(kind=kind, family=family, positive_index=index, target_row=row, expected_error=expected,
                edits=edits, defect=note)


# ----------------------------------------------------------------- witness specs
def seeds(family):
    """Indices of the plain Project/application seeds (and safe_point.restored outcome seeds)."""
    row = next(r for r in A.load('Plans/filesafe_event_authority_fixtures.json')['families'] if r['event_type'] == family)
    out = {}
    for i, case in enumerate(row['positive']):
        name = case['id'].split('.', 1)[1]
        out[name] = i
    return out


def specs():
    """(family, seed name, target row, expected code, change, keep, note) materialization witnesses."""
    out = []
    return out


def build(only=None):
    built, rejected = [], []
    for case in candidate_cases():
        if only and case['target_row'] not in only:
            continue
        outcome, first = P.first_refusal(case)
        ok = first is not None and first[1] == case['target_row']
        if case['kind'] == 'protocol':
            ok = ok and outcome == case['expected_results']
        elif case.get('expected_error') is None and first is not None:
            case['expected_error'] = next((c for c in outcome if isinstance(outcome, list)), None) if isinstance(outcome, list) and outcome else None
            ok = ok and case['expected_error'] is not None
        else:
            ok = ok and isinstance(outcome, list) and case['expected_error'] in outcome
        (built if ok else rejected).append((case, outcome, first))
    return built, rejected


def candidate_cases():
    import pm_filesafe_p2a_specs as S
    return S.cases(sys.modules[__name__])


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--only', action='append')
    args = parser.parse_args()
    pack = json.loads(FIXTURE.read_text())
    migrated = with_custody(pack)
    stale = []
    if dump(migrated) != FIXTURE.read_text():
        stale.append(str(FIXTURE.relative_to(ROOT)))
        if args.write:
            FIXTURE.write_text(dump(migrated))
            P._PACK.clear()
    built, rejected = build(args.only)
    for case, outcome, first in rejected:
        print('REJECTED', case['id'], case['target_row'], 'first', first, 'outcome', str(outcome)[:160])
    document = dict(schema_id='pm.filesafe.event_p2a_cases.v1', schema_version='1.0.0',
                    admission='prepared_without_admission', native_execution='NOT_RUN',
                    builder='scripts/pm-filesafe-p2a-cases.py',
                    cases=[case for case, _, _ in built])
    text = json.dumps(document, indent=2, ensure_ascii=True) + '\n'
    if not P.CASES.exists() or P.CASES.read_text() != text:
        stale.append(str(P.CASES.relative_to(ROOT)))
        if args.write and not args.only:
            P.CASES.write_text(text)
    print(f'{len(built)} cases kept, {len(rejected)} rejected; stale: {stale or "none"}')
    if args.check:
        return 1 if stale or rejected else 0
    return 0


if __name__ == '__main__':
    sys.exit(main())
