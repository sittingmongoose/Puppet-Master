#!/usr/bin/env python3
"""A0 currentness re-census of goal-replan-combined-source-20260921/v3 against a target revision.

Read-only. Reads the package copy (PuppetMaster-Packages, replan-v8/) and git objects of the main
repository; writes JSON results to OUT. It re-runs the frozen currentness-impact review's comparisons
(goal-replan-stop-currentness-impact-20260921/v1/check.py, manifest c7213eb4...) with the target moved from
4a72aa12 (not an ancestor of main) to the target revision, keeps 4a72aa12 as a second column so drift since
that review is visible, and adds the citation sets that review did not re-check (certified-v2 and
corrected-coordinator source citations, the scope passages, and the Replan v3 whole-definition evidence).

Usage: census.py PACKAGE_ROOT REPO TARGET_REV OUT_DIR
"""
import collections
import hashlib
import json
import pathlib
import re
import subprocess
import sys

PKG = pathlib.Path(sys.argv[1])            # .../replan-v8
REPO = sys.argv[2]
TARGET = sys.argv[3]
OUT = pathlib.Path(sys.argv[4])
OUT.mkdir(parents=True, exist_ok=True)

SRC = PKG / 'goal-replan-combined-source-20260921' / 'v3'
REVIEW_BASE = '4a72aa124739c9aeba8d1ab49865735feae528d8'
DIRECT_BASE = '13e7dbc0f1c36c9883420dd3d0fabd6758e54a60'
INHERITED_BASE = 'dd1df59d6307952d82a5c93be9ad4083a5bc0773'
SUBJECT_SHA = '9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e'


def sha(b):
    return hashlib.sha256(b).hexdigest()


def rj(p):
    return json.loads((SRC / p).read_text())


_cache = {}


def git_show(rev, path):
    k = (rev, path)
    if k not in _cache:
        r = subprocess.run(['git', '-C', REPO, 'show', f'{rev}:{path}'], capture_output=True)
        _cache[k] = r.stdout if r.returncode == 0 else None
    return _cache[k]


def git(*a):
    return subprocess.run(['git', '-C', REPO, *a], capture_output=True, text=True).stdout.strip()


def write(name, obj):
    (OUT / name).write_text(json.dumps(obj, indent=1, ensure_ascii=False) + '\n')


def status(b, h):
    if b is None:
        return 'MISSING'
    return 'EXACT' if sha(b) == h else 'CHANGED'


def json_diff(a, b, p=''):
    if a == b:
        return []
    if isinstance(a, dict) and isinstance(b, dict):
        out = []
        for k in sorted(a.keys() | b.keys()):
            out += json_diff(a.get(k), b.get(k), p + '/' + str(k).replace('~', '~0').replace('/', '~1'))
        return out
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        out = []
        for i, (x, y) in enumerate(zip(a, b)):
            out += json_diff(x, y, p + '/' + str(i))
        return out
    return [{'pointer': p, 'before': a, 'after': b}]


def md_change(old, new):
    """Line-level summary of how `new` differs from `old` (bytes)."""
    import difflib
    if new.startswith(old):
        return {'old_is_exact_prefix': True, 'appended_lines': len(new.splitlines()) - len(old.splitlines()),
                'removed_or_changed_old_lines': 0, 'hunks': []}
    a = old.decode('utf-8', 'replace').splitlines()
    b = new.decode('utf-8', 'replace').splitlines()
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    hunks = []
    removed = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            continue
        if tag in ('replace', 'delete'):
            removed += i2 - i1
        hunks.append({'op': tag, 'old_lines': [i1 + 1, i2], 'new_lines': [j1 + 1, j2],
                      'old_text_sha256': sha('\n'.join(a[i1:i2]).encode()) if i2 > i1 else None,
                      'old_first_line': a[i1][:160] if i2 > i1 else None,
                      'new_first_line': b[j1][:160] if j2 > j1 else None})
    return {'old_is_exact_prefix': False, 'appended_lines': None, 'removed_or_changed_old_lines': removed,
            'hunk_count': len(hunks), 'hunks': hunks}


result = {'target_rev': TARGET, 'target_commit': git('rev-parse', TARGET), 'review_base': REVIEW_BASE,
          'review_base_is_ancestor_of_target': subprocess.run(['git', '-C', REPO, 'merge-base', '--is-ancestor', REVIEW_BASE, TARGET]).returncode == 0,
          'direct_base_is_ancestor_of_target': subprocess.run(['git', '-C', REPO, 'merge-base', '--is-ancestor', DIRECT_BASE, TARGET]).returncode == 0,
          'inherited_base_is_ancestor_of_target': subprocess.run(['git', '-C', REPO, 'merge-base', '--is-ancestor', INHERITED_BASE, TARGET]).returncode == 0,
          'merge_base_review_base_target': git('merge-base', REVIEW_BASE, TARGET)}

# 1. Package authentication --------------------------------------------------------------------------
man_bytes = (SRC / 'manifest.json').read_bytes()
assert sha(man_bytes) == SUBJECT_SHA, 'subject manifest mismatch'
man = json.loads(man_bytes)
bad = []
for m in man['members']:
    b = (SRC / m['path']).read_bytes()
    if sha(b) != m['sha256'] or ('bytes' in m and len(b) != m['bytes']):
        bad.append(m['path'])
result['subject'] = {'manifest_sha256': SUBJECT_SHA, 'members': len(man['members']), 'bad_members': bad,
                     'status': man['status'], 'profile': man['profile'],
                     'combined_installed_contract_digest': man['combined_installed_contract_digest']}

# 2. Direct canonical pins -----------------------------------------------------------------------------
direct = []
for x in rj('canonical-pins.json'):
    src_bytes = (SRC / x['path']).read_bytes()
    assert sha(src_bytes) == x['sha256']
    at_base = git_show(x['git_commit'], x['git_path'])
    row = {'git_path': x['git_path'], 'source_commit': x['git_commit'], 'source_sha256': x['sha256'],
           'source_equals_pinned_commit': at_base is not None and sha(at_base) == x['sha256'],
           'status_at_review_base': status(git_show(REVIEW_BASE, x['git_path']), x['sha256']),
           'status_at_target': status(git_show(TARGET, x['git_path']), x['sha256'])}
    cur = git_show(TARGET, x['git_path'])
    rb = git_show(REVIEW_BASE, x['git_path'])
    row['target_sha256'] = sha(cur) if cur is not None else None
    row['target_equals_review_base'] = (cur is not None and rb is not None and cur == rb)
    if row['status_at_target'] == 'CHANGED':
        if x['git_path'].endswith('.json'):
            try:
                row['value_changes_vs_source'] = json_diff(json.loads(src_bytes), json.loads(cur))
                if rb is not None and rb != cur:
                    row['value_changes_review_base_to_target'] = json_diff(json.loads(rb), json.loads(cur))
            except Exception as e:  # noqa
                row['json_error'] = str(e)
        else:
            row['text_change_vs_source'] = md_change(src_bytes, cur)
            if rb is not None and rb != cur:
                row['text_change_review_base_to_target'] = md_change(rb, cur)
    direct.append(row)
write('direct-pins.json', direct)

# 3. Inherited Replan v3 canonical pins ------------------------------------------------------------------
inh = []
for x in rj('inputs/replan-v3/source-pins.json'):
    cur = git_show(TARGET, x['path'])
    rb = git_show(REVIEW_BASE, x['path'])
    row = {'git_path': x['path'], 'source_commit': x['commit'], 'source_sha256': x['sha256'],
           'status_at_review_base': status(rb, x['sha256']), 'status_at_target': status(cur, x['sha256']),
           'target_sha256': sha(cur) if cur is not None else None,
           'target_equals_review_base': cur is not None and rb is not None and cur == rb}
    if row['status_at_target'] == 'CHANGED':
        old = git_show(x['commit'], x['path'])
        if x['path'].endswith('.json'):
            try:
                row['value_change_count_vs_source'] = len(json_diff(json.loads(old), json.loads(cur)))
            except Exception as e:  # noqa
                row['json_error'] = str(e)
        else:
            c = md_change(old, cur)
            row['old_is_exact_prefix'] = c['old_is_exact_prefix']
            row['removed_or_changed_old_lines'] = c['removed_or_changed_old_lines']
            row['hunk_count'] = c.get('hunk_count', 0)
            row['changed_old_hunks'] = [h for h in c['hunks'] if h['op'] in ('replace', 'delete')]
    inh.append(row)
write('inherited-replan-pins.json', inh)


# 4. Exact passages -------------------------------------------------------------------------------------
def locate(buf, text):
    t = text.encode()
    n = buf.count(t) if buf is not None else 0
    lines = []
    if buf is not None and n:
        start = 0
        while True:
            i = buf.find(t, start)
            if i < 0:
                break
            lines.append(buf.count(b'\n', 0, i) + 1)
            start = i + 1
    return n, lines


def passage_rows(items, label, pathk, textk, commitk=None, startk=None, endk=None, default_commit=None, default_path=None):
    rows = []
    for x in items:
        path = x.get(pathk) if pathk else default_path
        text = x[textk]
        n_t, lines_t = locate(git_show(TARGET, path), text)
        n_r, _ = locate(git_show(REVIEW_BASE, path), text)
        rows.append({'set': label, 'id': x.get('id'), 'git_path': path,
                     'source_commit': x.get(commitk) if commitk else default_commit,
                     'source_lines': [x.get(startk), x.get(endk)] if startk else None,
                     'passage_sha256': sha(text.encode()),
                     'occurrences_at_review_base': n_r, 'occurrences_at_target': n_t,
                     'target_start_lines': lines_t})
    return rows


passages = []
passages += passage_rows(rj('inputs/replan-v3/exact-passages.json'), 'replan-v3-exact-passages', 'path', 'text', 'commit', 'line_start', 'line_end')
passages += passage_rows(rj('inputs/certified-v2/source-citations.json'), 'certified-v2-source-citations', 'path', 'text', 'base_commit', 'start_line', 'end_line')
cc = rj('inputs/upstream-correction-v3/coordinator-corrected/source-citations.json')
cc_same = cc == rj('inputs/certified-v2/source-citations.json')
scope = rj('inputs/scope/source-evidence.json')
passages += passage_rows(scope['passages'], 'scope-source-evidence', None, 'text', None, 'start', 'end',
                         default_commit=scope['git_commit'], default_path='Plans/Goal_Runtime_System.md')
write('passages.json', passages)

# 5. Whole-definition evidence (JSON pointer -> whole definition) ----------------------------------------


def resolve(doc, pointer):
    cur = doc
    for part in pointer.lstrip('/').split('/') if pointer not in ('', '/') else []:
        part = part.replace('~1', '/').replace('~0', '~')
        if isinstance(cur, list):
            cur = cur[int(part)]
        else:
            cur = cur[part]
    return cur


wdefs = []
docs = {}
for x in rj('inputs/replan-v3/whole-definition-evidence.json'):
    p = x['path']
    if p not in docs:
        b = git_show(TARGET, p)
        docs[p] = (json.loads(b) if b is not None else None, sha(b) if b is not None else None)
    d, h = docs[p]
    if d is None:
        st = 'MISSING_FILE'
    else:
        try:
            st = 'EXACT' if resolve(d, x['pointer']) == x['whole_definition'] else 'CHANGED'
        except (KeyError, IndexError, ValueError, TypeError):
            st = 'MISSING_POINTER'
    wdefs.append({'git_path': p, 'pointer': x['pointer'], 'source_whole_sha256': x['whole_sha256'],
                  'target_whole_sha256': h, 'whole_file_exact': h == x['whole_sha256'], 'definition_status': st})
write('whole-definitions.json', wdefs)

# 6. Original coordinates -----------------------------------------------------------------------------
origs = []
for x in rj('original-whole-files.json'):
    for p in x['original_paths']:
        if '/after/Plans/' in p:
            cp = 'Plans/' + p.split('/after/Plans/', 1)[1]
            origs.append({'git_path': cp, 'source_coordinate': p, 'whole_bank_path': x['path'], 'sha256': x['sha256'],
                          'status_at_review_base': status(git_show(REVIEW_BASE, cp), x['sha256']),
                          'status_at_target': status(git_show(TARGET, cp), x['sha256'])})
write('original-coordinates.json', origs)

# 7. Parent authentication (what the package copy can authenticate) -------------------------------------
LOCAL_PARENT = {
    'replan-v3': PKG / 'goal-run-replanned-source-contract-20260920-relocated-20260921' / 'v3' / 'manifest.json',
    'scope': PKG / 'goal-replan-combined-scope-adjudication-20260921' / 'v1' / 'manifest.json',
    'scope-addendum': PKG / 'goal-replan-combined-scope-adjudication-20260921' / 'addendum-001' / 'manifest.json',
}
INPUT_COPY = {'certified-v2': 'inputs/certified-v2/manifest.json', 'replan-v3': 'inputs/replan-v3/manifest.json',
              'scope': 'inputs/scope/manifest.json', 'scope-addendum': 'inputs/scope-addendum/manifest.json',
              'plan': 'inputs/plan/manifest.json', 'upstream-correction-v3': 'inputs/upstream-correction-v3/manifest.json',
              'upstream-correction-review-v3': 'inputs/upstream-correction-review-v3/manifest.json',
              'corrected-coordinator': 'inputs/upstream-correction-v3/coordinator-corrected/manifest.json'}
parents = []
for x in rj('parent-pins.json'):
    row = {'label': x['label'], 'original_manifest_path': x['manifest_path'], 'manifest_sha256': x['manifest_sha256'],
           'whole_members_authenticated_by_source': x.get('whole_members_authenticated')}
    lp = LOCAL_PARENT.get(x['label'])
    if lp is not None and lp.exists():
        mb = lp.read_bytes()
        row['whole_copy_in_package'] = str(lp.relative_to(PKG))
        row['whole_copy_manifest_exact'] = sha(mb) == x['manifest_sha256']
        m = json.loads(mb)
        members = m.get('members', m.get('files'))
        badm = []
        for y in members:
            z = lp.parent / y['path']
            if not z.exists():
                badm.append(y['path'] + ' (missing)')
                continue
            b = z.read_bytes()
            if sha(b) != y['sha256'] or ('bytes' in y and len(b) != y['bytes']):
                badm.append(y['path'])
        row['whole_copy_members'] = len(members)
        row['whole_copy_bad_members'] = badm
    else:
        row['whole_copy_in_package'] = None
    ic = SRC / INPUT_COPY[x['label']]
    if ic.exists():
        mb = ic.read_bytes()
        row['embedded_manifest_copy'] = INPUT_COPY[x['label']]
        row['embedded_manifest_copy_exact'] = sha(mb) == x['manifest_sha256']
        m = json.loads(mb)
        members = m.get('members', m.get('files'))
        present = ok = 0
        badc = []
        for y in members:
            z = ic.parent / y['path']
            if z.exists():
                present += 1
                if sha(z.read_bytes()) == y['sha256']:
                    ok += 1
                else:
                    badc.append(y['path'])
        row['embedded_members_present'] = present
        row['embedded_members_exact'] = ok
        row['embedded_members_bad'] = badc
    parents.append(row)
write('parent-authentication.json', parents)


# 8. Registry deltas: inherited base -> review base -> target -------------------------------------------------
def reg_rows(rev, f):
    b = git_show(rev, f)
    return json.loads(b) if b is not None else None


regs = []
for f, key in [('Plans/event_family_registry.json', 'family_id'), ('Plans/storage_value_registry.json', 'family_id')]:
    revs = {'inherited_base': INHERITED_BASE, 'direct_base': DIRECT_BASE, 'review_base': REVIEW_BASE, 'target': TARGET}
    docs_r = {k: reg_rows(v, f) for k, v in revs.items()}
    entry = {'path': f, 'sha256': {k: sha(git_show(v, f)) for k, v in revs.items()}}
    for k, d in docs_r.items():
        entry.setdefault('family_count', {})[k] = len(d['families'])
        entry.setdefault('revision', {})[k] = d.get('registry_revision')
    for a, b in [('inherited_base', 'target'), ('review_base', 'target')]:
        A = {r[key]: r for r in docs_r[a]['families']}
        B = {r[key]: r for r in docs_r[b]['families']}
        entry[f'{a}_to_{b}'] = {
            'added': sorted(B.keys() - A.keys()), 'removed': sorted(A.keys() - B.keys()),
            'modified': {k: [c['pointer'] for c in json_diff(A[k], B[k])] for k in sorted(A.keys() & B.keys()) if A[k] != B[k]},
            'other_top_level_changed': sorted(k for k in (docs_r[a].keys() | docs_r[b].keys()) if k != 'families' and docs_r[a].get(k) != docs_r[b].get(k)),
        }
    regs.append(entry)
write('registry-deltas.json', regs)

# 9. v8 proposed physical families against the target storage registry ------------------------------------------
phys = rj('replan-and-combined-physical-families.json')
storage = reg_rows(TARGET, 'Plans/storage_value_registry.json')
sv_ids = {r['family_id'] for r in storage['families']}
sv_schema = collections.defaultdict(list)
for r in storage['families']:
    sv_schema[r.get('value_schema_id')].append(r['family_id'])


def iter_families(obj):
    if isinstance(obj, dict):
        if 'family_id' in obj:
            yield obj
        for v in obj.values():
            yield from iter_families(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from iter_families(v)


proposed = list(iter_families(phys))
prow = []
for r in proposed:
    fid = r['family_id']
    prow.append({'family_id': fid, 'present_in_target_storage_registry': fid in sv_ids,
                 'value_schema_id': r.get('value_schema_id'),
                 'target_rows_with_same_value_schema_id': sv_schema.get(r.get('value_schema_id'), []) if r.get('value_schema_id') else []})
write('proposed-physical-families.json', {'source_file': 'replan-and-combined-physical-families.json',
                                          'proposed_count': len(prow), 'distinct_family_ids': len({p['family_id'] for p in prow}),
                                          'rows': prow})

# 10. Owner additions since each base, by unit heading ----------------------------------------------------------
UNIT = re.compile(r'^(#{2,6})\s+(.*)$')


def units(buf):
    out = []
    if buf is None:
        return out
    for i, l in enumerate(buf.decode('utf-8', 'replace').splitlines(), 1):
        m = UNIT.match(l)
        if m:
            out.append((i, m.group(2).strip()))
    return out


owner = []
md_paths = sorted({x['git_path'] for x in direct if x['git_path'].endswith('.md')} |
                  {x['git_path'] for x in inh if x['git_path'].endswith('.md') and x['status_at_target'] == 'CHANGED'})
for p in md_paths:
    base_commit = DIRECT_BASE if any(x['git_path'] == p for x in direct) else INHERITED_BASE
    for label, rev in [('pinned_base', base_commit), ('review_base', REVIEW_BASE)]:
        old = git_show(rev, p)
        new = git_show(TARGET, p)
        if old is None or new is None or old == new:
            continue
        oh = collections.Counter(h for _, h in units(old))
        added = []
        seen = collections.Counter()
        for ln, h in units(new):
            seen[h] += 1
            if seen[h] > oh.get(h, 0):
                added.append({'line': ln, 'heading': h})
        nh = collections.Counter(h for _, h in units(new))
        removed = [h for h in oh if nh.get(h, 0) < oh[h]]
        owner.append({'path': p, 'from': label, 'from_commit': rev, 'old_is_exact_prefix': new.startswith(old),
                      'old_lines': len(old.splitlines()), 'new_lines': len(new.splitlines()),
                      'added_headings': added, 'removed_or_renamed_headings': removed})
write('owner-additions.json', owner)

# Summary ---------------------------------------------------------------------------------------------
C = collections.Counter
summary = dict(result)
summary['direct'] = {'at_review_base': dict(C(x['status_at_review_base'] for x in direct)),
                     'at_target': dict(C(x['status_at_target'] for x in direct)),
                     'target_equals_review_base': sum(x['target_equals_review_base'] for x in direct),
                     'changed_markdown_not_prefix': [x['git_path'] for x in direct if x.get('text_change_vs_source', {}).get('old_is_exact_prefix') is False],
                     'changed_since_review_base': [x['git_path'] for x in direct if not x['target_equals_review_base']]}
summary['inherited_replan'] = {'at_review_base': dict(C(x['status_at_review_base'] for x in inh)),
                               'at_target': dict(C(x['status_at_target'] for x in inh)),
                               'changed_at_target': [x['git_path'] for x in inh if x['status_at_target'] != 'EXACT'],
                               'changed_since_review_base': [x['git_path'] for x in inh if not x['target_equals_review_base']],
                               'markdown_not_prefix': [x['git_path'] for x in inh if x.get('old_is_exact_prefix') is False]}
summary['passages'] = {s: {'total': sum(1 for p in passages if p['set'] == s),
                           'found_at_review_base': sum(1 for p in passages if p['set'] == s and p['occurrences_at_review_base'] > 0),
                           'found_at_target': sum(1 for p in passages if p['set'] == s and p['occurrences_at_target'] > 0),
                           'missing_at_target': [[p['git_path'], p['source_lines'], p['id']] for p in passages if p['set'] == s and p['occurrences_at_target'] == 0]}
                       for s in dict.fromkeys(p['set'] for p in passages)}
summary['passages']['corrected_coordinator_citations_identical_to_certified_v2'] = cc_same
summary['whole_definitions'] = {'total': len(wdefs), 'by_status': dict(C(w['definition_status'] for w in wdefs)),
                                'whole_file_exact': sum(w['whole_file_exact'] for w in wdefs),
                                'not_exact': sorted({(w['git_path'], w['pointer'], w['definition_status']) for w in wdefs if w['definition_status'] != 'EXACT'})}
summary['original_coordinates'] = {'at_review_base': dict(C(x['status_at_review_base'] for x in origs)),
                                   'at_target': dict(C(x['status_at_target'] for x in origs)),
                                   'changed_at_target': sorted({x['git_path'] for x in origs if x['status_at_target'] != 'EXACT'})}
summary['parents'] = [{k: v for k, v in p.items() if k in ('label', 'manifest_sha256', 'whole_copy_in_package', 'whole_copy_manifest_exact', 'whole_copy_bad_members', 'embedded_manifest_copy_exact', 'embedded_members_present', 'embedded_members_exact', 'embedded_members_bad', 'whole_members_authenticated_by_source')} for p in parents]
summary['registries'] = [{'path': r['path'], 'family_count': r['family_count'], 'revision': r['revision'],
                          'review_base_to_target': r['review_base_to_target'],
                          'inherited_base_to_target_counts': {k: len(v) if not isinstance(v, dict) else len(v) for k, v in r['inherited_base_to_target'].items()}} for r in regs]
summary['proposed_physical_families'] = {'count': len(prow), 'distinct': len({p['family_id'] for p in prow}),
                                         'present_in_target': [p['family_id'] for p in prow if p['present_in_target_storage_registry']],
                                         'schema_id_shared_with_target_rows': {p['family_id']: p['target_rows_with_same_value_schema_id'] for p in prow if p['target_rows_with_same_value_schema_id']}}
write('summary.json', summary)
print(json.dumps(summary, indent=1)[:12000])
