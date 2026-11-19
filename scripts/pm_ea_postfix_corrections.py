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


def git_context(root):
    selected = Path(root).resolve()
    try:
        top = subprocess.check_output(['git','-C',str(selected),'rev-parse','--show-toplevel'],stderr=subprocess.DEVNULL).decode().strip()
    except subprocess.SubprocessError as exc:
        raise ValueError('correction root has no Git history') from exc
    if Path(top).resolve() != selected:
        raise ValueError('correction proof cannot borrow a parent checkout history')
    return selected


@lru_cache(maxsize=64)
def git_bytes(root, commit, path):
    root = git_context(root)
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


def application_commit(root, path, raw_sha):
    root = git_context(root)
    head = subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD']).decode().strip()
    return _application_commit_cached(str(root),head,path,raw_sha)


@lru_cache(maxsize=512)
def _application_commit_cached(root, head, path, raw_sha):
    commits = subprocess.check_output(['git', '-C', str(root), 'log', '--format=%H', '--diff-filter=A', head, '--', path]).decode().splitlines()
    matches = [c for c in commits if sha(git_bytes(root, c, path)) == raw_sha]
    if len(matches) != 1:
        raise ValueError('correction is not one immutable Git application witness: '+path)
    return matches[0]


def witness(record, root, *, require_committed=True):
    root = git_context(root)
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
    if old_record['registry_row_sha256'] != canonical(doc['before_row']):
        raise ValueError('predecessor record does not pin the actual before row')
    if record['depth_assessment']['path'] != old_record['depth_assessment']['path']:
        raise ValueError('correction changes the assessment path')
    old_log = git_bytes(root,source,'Plans/Decision_Log.md')
    marker = ('### '+old_record['decision_ref'].split('#')[1]+':').encode()
    if old_log.count(marker) != 1:
        raise ValueError('predecessor decision is missing or ambiguous')
    start = old_log.index(marker)
    body_start = old_log.index(b'\n',start)+1
    following = re.search(rb'(?m)^#{1,3} ',old_log[body_start:])
    end = body_start+following.start() if following else len(old_log)
    if sha(old_log[start:end]) != old_record['decision_section_sha256']:
        raise ValueError('predecessor decision pin differs from its actual Git bytes')
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
    """Rebuild exact complete predecessor bytes with one hash per state.

    A larger later registry may use an exact, hash-matching prefix as its first
    witness. No row or revision is inferred without the complete pinned hash.
    """
    pending = {}
    for path in sorted((Path(root)/DIRECTORY).glob('*.json')):
        try:
            rec = json.loads(path.read_text())
            after = rec['registry_after']
            before = rec['registry_before']
            valid = (type(after['family_count']) is int and type(before['family_count']) is int
                and after['family_count']==before['family_count']
                and isinstance(after['revision'],str) and isinstance(before['revision'],str)
                and isinstance(rec['registry_row'],dict) and isinstance(rec['before_row'],dict)
                and all(isinstance(side.get('sha256'),str) and re.fullmatch(r'[0-9a-f]{64}',side['sha256']) for side in (before,after)))
            if valid:
                pending.setdefault(after['sha256'],[]).append(rec)
        except (OSError,ValueError,KeyError,TypeError):
            continue
    states, current = [], doc
    raw = rendered(current)
    while pending:
        matches = pending.get(sha(raw),[])
        if not matches and not states:
            # Later admissions can append rows after this correction sequence.
            # Exact prefix comparison is the same proof used by S5b states.
            candidates=[]
            earlier_hashes={rec['registry_before']['sha256'] for records in pending.values() for rec in records}
            tips=set(pending)-earlier_hashes
            for digest,records in pending.items():
                if digest not in tips:continue
                for rec in records:
                    after=rec['registry_after'];count=after['family_count']
                    if count>len(current['families']):continue
                    prefix=dict(current,families=current['families'][:count],registry_revision=after['revision'])
                    candidate=rendered(prefix)
                    if pin(candidate)==after:candidates.append((rec,prefix,candidate))
            if len(candidates)!=1:break
            rec,current,raw=candidates[0]
        elif len(matches)==1:
            rec=matches[0]
        else:
            break
        if pin(raw)!=rec['registry_after']:break
        earlier=copy.deepcopy(current)
        at=[i for i,row in enumerate(earlier['families']) if row['event_type']==rec['event_type']]
        if len(at)!=1 or earlier['families'][at[0]]!=rec['registry_row']:break
        earlier['families'][at[0]]=rec['before_row']
        earlier['registry_revision']=rec['registry_before']['revision']
        before_raw=rendered(earlier)
        if pin(before_raw)!=rec['registry_before']:break
        states.append(earlier)
        del pending[rec['registry_after']['sha256']]
        current,raw=earlier,before_raw
    return states
