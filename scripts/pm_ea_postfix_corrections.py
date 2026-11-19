"""Authenticated one-family MERGE3 correction witnesses; no new admissions.

The immutable application commit is found in Git, not trusted from a receipt.
Its first parent, full registry transition and original admission record must
match the witness. Later citation maintenance may refresh the current record,
but cannot change that correction or the original append checkpoints.
"""
import copy
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re
import subprocess

REGISTRY = 'Plans/event_family_registry.json'
RECORDS = 'reports/event-authority-20260911/admission-records'
DIRECTORY = 'reports/event-authority-20261116/admission-merge-3/corrections'
AUTHORITY = 'MERGE3-POSTFIX / post-landing Astra findings'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(value):
    return sha(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode())


def rendered(value):
    return (json.dumps(value, indent=2, ensure_ascii=False)+'\n').encode()


@lru_cache(maxsize=64)
def git_bytes(root, commit, path):
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('correction predecessor must be a full Git commit')
    return subprocess.check_output(['git', '-C', str(root), 'show', commit+':'+path])


def pin(raw):
    doc = json.loads(raw)
    return dict(revision=doc['registry_revision'], sha256=sha(raw), family_count=len(doc['families']))


def corrected_row(before, root):
    """Only the reviewed selector/scope fields, independently from the witness."""
    from pm_ea_payload_selectors import selector_id, selector_source, owner_selector_bindings
    root = Path(root)
    row = copy.deepcopy(before)
    event = row['event_type']
    if event not in {key[0] for key in owner_selector_bindings(str(root.resolve()))}:
        return row
    if event in ('panel.redocked', 'panel.undocked'):
        manifest = json.loads((root/'Plans/panel_event_contracts/manifest.json').read_text())
        family = next(x for x in manifest['families'] if x['event_type'] == event)
        fixtures = json.loads((root/('Plans/panel_event_contracts/'+family['slug']+'.fixtures.json')).read_text())
        scopes = {'application' if c['value']['project_id'] is None else 'project' for c in fixtures['payload_cases'] if c['valid']}
        if scopes != {'application', 'project'}:
            raise ValueError('panel owner positives do not establish both editions')
        row['scope_policy'] = 'application_or_project'
        row['payload_selection_policy'] = 'exact_scope_and_schema_id_no_fallback'
        project = copy.deepcopy((row.get('payload_versions') or [dict(scope_kind='project',
            payload_schema_id=row['payload_schema_id'], payload_schema_ref=row['payload_schema_ref'],
            retention_policy_ref=row['retention_policy_ref'])])[0])
        project.update(source_graph_ref='Plans/Contracts_V0.md#CV-366',
            producer_admission='requires_owner_adoption', append_owner_ref=row['semantic_owner_doc'],
            read_owner_ref=row['semantic_owner_doc'], backup_owner_ref='Plans/Backup_Restore_System.md#BRS-033')
        application = copy.deepcopy(project)
        application['scope_kind'] = 'application'
        row['payload_versions'] = [application, project]
    editions = row.get('payload_versions') or [dict(scope_kind=row['scope_policy'].removesuffix('_only'),
        payload_schema_id=row['payload_schema_id'], payload_schema_ref=row['payload_schema_ref'])]
    for edition in editions:
        ref = edition.get('payload_schema_ref', row['payload_schema_ref'])
        schema = json.loads((root/ref['path']).read_text(), parse_int=str)
        for part in ref.get('json_pointer', '#').removeprefix('#').split('/')[1:]:
            schema = schema[part.replace('~1', '/').replace('~0', '~')]
        resource = schema.get('$id') or schema.get('x-schema-id') or schema.get('properties', {}).get('schema_id', {}).get('const')
        selected = selector_id(event, edition['scope_kind'], schema, resource, root=root)
        edition['payload_schema_id'] = selected
        if selected != resource:
            source = selector_source(event, edition['scope_kind'], schema, resource, ref['path'], ref.get('json_pointer', '#'), root=root)
            if source not in row['source_refs']:
                row['source_refs'].append(source)
    default = next((x for x in editions if x['scope_kind'] == 'project'), editions[0])
    row['payload_schema_id'] = default['payload_schema_id']
    return row


@lru_cache(maxsize=512)
def application_commit(root, path, raw_sha):
    commits = subprocess.check_output(['git', '-C', str(root), 'log', '--format=%H', '--diff-filter=A', 'HEAD', '--', path]).decode().splitlines()
    matches = [c for c in commits if sha(git_bytes(root, c, path)) == raw_sha]
    if len(matches) != 1:
        raise ValueError('correction is not one immutable Git application witness: '+path)
    return matches[0]


def witness(record, root, *, require_committed=True):
    root = Path(root).resolve()
    path = record.get('postfix_correction')
    expected = DIRECTORY+'/'+record['event_type']+'.json'
    if path != expected:
        raise ValueError('unexpected correction record path')
    raw = (root/path).read_bytes()
    doc = json.loads(raw)
    event = record['event_type']
    if doc.get('authority') != AUTHORITY or doc.get('event_type') != event:
        raise ValueError('correction authority/family differs')
    source = doc['source_commit']
    old_record_raw = git_bytes(root, source, RECORDS+'/'+event+'.json')
    old_record = json.loads(old_record_raw)
    before_raw = git_bytes(root, source, REGISTRY)
    before = json.loads(before_raw)
    if doc['predecessor_record_sha256'] != sha(old_record_raw):
        raise ValueError('correction predecessor record pin differs from Git')
    old_depth = git_bytes(root, source, old_record['depth_assessment']['path'])
    if doc['predecessor_assessment_sha256'] != sha(old_depth) or old_record['depth_assessment']['sha256'] != sha(old_depth):
        raise ValueError('correction predecessor assessment differs from Git')
    original = old_record.get('original_admission_decision_ref', old_record['decision_ref'])
    if doc['original_admission_decision_ref'] != original or record.get('original_admission_decision_ref') != original:
        raise ValueError('original admission authority changed')
    for side in ('registry_before', 'registry_after'):
        if record[side] != old_record[side]:
            raise ValueError('original append checkpoint changed')
    if doc['registry_before'] != pin(before_raw):
        raise ValueError('correction registry predecessor differs from Git')
    indices = [i for i, row in enumerate(before['families']) if row['event_type'] == event]
    if len(indices) != 1 or before['families'][indices[0]] != doc['before_row']:
        raise ValueError('correction before row differs from Git')
    after = copy.deepcopy(before)
    after['registry_revision'] = doc['registry_after']['revision']
    after['families'][indices[0]] = doc['registry_row']
    after_raw = rendered(after)
    if doc['registry_after'] != pin(after_raw) or doc['registry_before']['family_count'] != doc['registry_after']['family_count']:
        raise ValueError('correction is not an exact one-family transition')
    if record['registry_row_sha256'] != canonical(doc['registry_row']) or record['decision_ref'] != doc['decision_ref']:
        raise ValueError('current row/decision is not the correction successor')
    changed = {k for k in set(doc['before_row']) | set(doc['registry_row']) if doc['before_row'].get(k) != doc['registry_row'].get(k)}
    if changed - {'payload_schema_id', 'payload_schema_ref', 'payload_versions', 'payload_selection_policy', 'scope_policy', 'source_refs'}:
        raise ValueError('correction changes an unreviewed registry field')
    if changed and not set(doc['findings']) & {1, 2, 3}:
        raise ValueError('registry change has no selector/scope finding')
    if doc['registry_row'] != corrected_row(doc['before_row'], root):
        raise ValueError('correction successor is not exactly derived from the owner bindings')
    if not doc['findings'] or set(doc['findings']) - {1, 2, 3, 4, 5, 6, 7}:
        raise ValueError('unreviewed correction finding')
    if event == 'filesafe.policy_degraded' and 'plan_unit_id: DL-2450' not in (root/'Plans/Decision_Log.md').read_text():
        raise ValueError('FileSafe correction requires the signed count decision')
    if require_committed:
        applied = application_commit(str(root), path, sha(raw))
        parents = subprocess.check_output(['git', '-C', str(root), 'rev-list', '--parents', '-n', '1', applied]).decode().split()
        if parents[1:] != [source]:
            raise ValueError('correction application parent differs from its source')
        if git_bytes(root, applied, REGISTRY) != after_raw:
            raise ValueError('application commit registry differs from its one-family witness')
        applied_record = git_bytes(root, applied, RECORDS+'/'+event+'.json')
        applied_depth = git_bytes(root, applied, old_record['depth_assessment']['path'])
        if sha(applied_record) != doc['applied_record_sha256'] or sha(applied_depth) != doc['applied_assessment_sha256']:
            raise ValueError('application record/assessment pins differ from Git')
        doc = dict(doc, application_commit=applied)
    return doc, old_record


def problem(record, root):
    try:
        witness(record, root)
    except (ValueError, KeyError, TypeError, OSError, subprocess.SubprocessError) as exc:
        return 'registry_after_mismatch', dict(route='postfix_correction', reason=str(exc))
    return None


def prior_states(doc, root):
    """Rebuild exact complete predecessor bytes, newest correction first."""
    pending = []
    for path in sorted((Path(root)/DIRECTORY).glob('*.json')):
        try:
            pending.append(json.loads(path.read_text()))
        except (OSError, ValueError):
            continue
    states, current = [], doc
    while pending:
        for rec in pending:
            if pin(rendered(current)) != rec['registry_after']:
                continue
            earlier = copy.deepcopy(current)
            at = [i for i, r in enumerate(earlier['families']) if r['event_type'] == rec['event_type']]
            if len(at) != 1 or earlier['families'][at[0]] != rec['registry_row']:
                continue
            earlier['families'][at[0]] = rec['before_row']
            earlier['registry_revision'] = rec['registry_before']['revision']
            if pin(rendered(earlier)) != rec['registry_before']:
                continue
            states.append(earlier)
            current = earlier
            pending.remove(rec)
            break
        else:
            break
    return states
