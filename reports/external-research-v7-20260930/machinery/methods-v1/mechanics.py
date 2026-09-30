#!/usr/bin/env python3
"""Small deterministic experiment mechanics. No research answers or candidate launches."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time


def digest(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':')).encode()


def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + '\n')


def text_body(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError('complete authored body required')
    return value


def finding(value):
    required = {'id', 'version', 'body', 'state', 'previous_sha256'}
    if required - value.keys():
        raise ValueError('incomplete whole finding version')
    if not re.fullmatch(r'[A-Za-z0-9_-]+', value['id']):
        raise ValueError('unsafe finding identity')
    if type(value['version']) is not int or value['version'] < 1:
        raise ValueError('positive integer version required')
    if value['state'] not in ('current', 'unresolved', 'rejected'):
        raise ValueError('unknown assertion state')
    text_body(value['body'])
    if value['version'] == 1 and value['previous_sha256'] is not None:
        raise ValueError('first version has no predecessor')
    for v in value.get('validation', []):
        if v.get('status') == 'UNEXECUTED':
            if 'UNEXECUTED' not in v.get('text', ''):
                raise ValueError('proposed validation must carry literal UNEXECUTED')
        elif v.get('status') == 'executed':
            if not v.get('execution_evidence'):
                raise ValueError('executed validation needs actual evidence locator')
        else:
            raise ValueError('validation status required')
    return value


def retain_versions(source, retained):
    """Only validated whole versions; snapshots are immutable and same-ID mutation fails."""
    source, retained = Path(source), Path(retained)
    retained.mkdir(parents=True, exist_ok=True)
    count = 0
    for path in sorted(source.glob('*.json')):
        if path.is_symlink():
            raise ValueError('symlink version forbidden')
        raw = path.read_bytes()
        try:
            value = finding(json.loads(raw))
        except json.JSONDecodeError:
            # A file still being written is not a completed JSON version. No submission acknowledgement.
            continue
        target = retained / f'{value["id"]}.{value["version"]:04d}.json'
        if target.exists():
            if target.read_bytes() != raw:
                raise ValueError(f'mutation of retained version: {target.name}')
        else:
            with target.open('xb') as f:
                f.write(raw)
            target.chmod(0o444)
            count += 1
    return count


def load_versions(source):
    grouped = {}
    for path in sorted(Path(source).glob('*.json')):
        if path.is_symlink():
            raise ValueError('symlink version forbidden')
        raw = path.read_bytes()
        value = finding(json.loads(raw))
        grouped.setdefault(value['id'], []).append((value, digest(raw)))
    if not grouped:
        raise ValueError('no whole findings')
    for fid, versions in grouped.items():
        versions.sort(key=lambda v: v[0]['version'])
        for n, (v, pin) in enumerate(versions, 1):
            if v['version'] != n:
                raise ValueError(f'{fid}: duplicate or missing version')
            if n > 1 and v['previous_sha256'] != versions[n - 2][1]:
                raise ValueError(f'{fid}: predecessor hash mismatch')
    return grouped


def render_versions(source, report, history):
    grouped = load_versions(source)
    sections = {'current': [], 'unresolved': [], 'rejected': []}
    historical = []
    for fid in sorted(grouped):
        versions = grouped[fid]
        v = versions[-1][0]
        sections[v['state']].append(f'### {fid}\n\n' + v['body'])
        historical.extend({'id': fid, 'sha256': pin, **val} for val, pin in versions[:-1])
    # Rejected bodies stay outside current report so they cannot silently become assertions.
    current = '# Current research report\n\n## Current findings\n\n'
    current += '\n\n'.join(sections['current']) or 'No current findings.'
    current += '\n\n## Unresolved findings (not confirmed assertions)\n\n'
    current += '\n\n'.join(sections['unresolved']) or 'None recorded.'
    Path(report).write_text(current + '\n')
    write(history, {'superseded': historical, 'rejected_current_versions': sections['rejected'],
                    'rendering': 'Body bytes copied exactly; headings mechanically added; no semantic rewrite.'})
    return {'findings': len(grouped), 'current': len(sections['current']),
            'unresolved': len(sections['unresolved']), 'rejected': len(sections['rejected']),
            'report_sha256': digest(Path(report).read_bytes())}


def render_amendments(seed_path, decision_path, report, history):
    seed = json.loads(Path(seed_path).read_text())
    # Seeds are unverified candidate-accessible study output, never an evaluator answer key.
    originals = {v['id']: v for v in seed['findings']}
    if len(originals) != len(seed['findings']):
        raise ValueError('duplicate seed finding')
    decisions = json.loads(Path(decision_path).read_text())['decisions']
    seen, current, unresolved, historical = set(), [], [], []
    for d in decisions:
        fid, status = d['id'], d['decision']
        if fid not in originals or fid in seen:
            raise ValueError('unknown/duplicate amendment identity')
        seen.add(fid)
        original = text_body(originals[fid]['body'])
        if d.get('input_sha256') != digest(encoded(originals[fid])):
            raise ValueError('amendment is not bound to exact seed finding')
        text_body(d.get('reason', ''))
        if status not in ('supported', 'qualified', 'rejected', 'unresolved'):
            raise ValueError('explicit verifier disposition required')
        if status in ('supported', 'qualified'):
            # Supported means preserve complete original. Qualified requires complete replacement.
            body = original if status == 'supported' else text_body(d.get('replacement_body', ''))
            current.append(f'### {fid}\n\n{body}')
        elif status == 'unresolved':
            body = d.get('replacement_body') or original
            unresolved.append(f'### {fid}\n\n{text_body(body)}\n\nVerifier uncertainty: {d["reason"]}')
        historical.append({'original': originals[fid], 'decision': d})
    # No default confirmation: omissions remain visibly unresolved.
    for fid in sorted(originals.keys() - seen):
        unresolved.append(f'### {fid}\n\n{text_body(originals[fid]["body"])}\n\nNo verifier decision; unconfirmed.')
    for addition in json.loads(Path(decision_path).read_text()).get('additions', []):
        fid = addition['id']
        if fid in originals or fid in seen:
            raise ValueError('duplicate addition identity')
        seen.add(fid)
        if addition.get('decision') not in ('supported', 'qualified', 'unresolved'):
            raise ValueError('addition must be explicitly assessed')
        body = text_body(addition['body'])
        target = unresolved if addition['decision'] == 'unresolved' else current
        target.append(f'### {fid}\n\n{body}')
        historical.append({'addition': addition})
    result = '# Current research report\n\n## Current findings\n\n'
    result += '\n\n'.join(current) or 'No current findings.'
    result += '\n\n## Unresolved findings (not confirmed assertions)\n\n'
    result += '\n\n'.join(unresolved) or 'None recorded.'
    Path(report).write_text(result + '\n')
    write(history, {'verifier_history': historical, 'omitted_decisions': sorted(originals.keys() - seen)})
    return {'current': len(current), 'unresolved': len(unresolved), 'exact_render': True}


def parse_source(raw, settings):
    if settings.get('encoding', 'utf-8') != 'utf-8':
        raise ValueError('only declared UTF-8 parser supported')
    text = raw.decode('utf-8')
    lines = text.splitlines()
    headings = [{'line': i + 1, 'heading': s} for i, s in enumerate(lines)
                if re.match(r'^#{1,6}\s', s)]
    return {'lines': lines, 'headings': headings, 'original_bytes': len(raw), 'sha256': digest(raw)}


def acquire_source(source, dependency, cache, counters, reuse):
    """Local frozen acquisition: counts real file reads/parses, never invents network fetches."""
    dep = json.loads(Path(dependency).read_text())
    required = {'source_sha256', 'source_version', 'permissions', 'parser', 'settings',
                'applicability', 'corpus_membership_sha256', 'negative_scope_sha256'}
    if required - dep.keys():
        raise ValueError('cache key lacks applicability/currentness dependencies')
    if dep['parser'] != 'mechanics.parse_source-v1':
        raise ValueError('unsupported parser identity')
    key = digest(encoded(dep))
    cache, counters = Path(cache), Path(counters)
    cache.mkdir(parents=True, exist_ok=True)
    # Counters are attempt-local; serial CLI use is the prospective binding.
    c = json.loads(counters.read_text()) if counters.exists() else {
        'local_acquisitions': 0, 'network_fetches': 0, 'parses': 0, 'bytes_read': 0, 'hits': 0,
        'cache_bytes_read': 0, 'cold_seconds': 0.0, 'warm_seconds': 0.0, 'events': []}
    t0 = time.monotonic()
    entry = cache / key
    hit = bool(reuse and entry.is_dir())
    if hit:
        raw = (entry / 'source.blob').read_bytes()
        if digest(raw) != dep['source_sha256'] or json.loads((entry / 'dependency.json').read_text()) != dep:
            raise ValueError('cache corruption/dependency mismatch')
        parsed_raw = (entry / 'parsed.json').read_bytes()
        if digest(parsed_raw) != (entry / 'parsed.sha256').read_text().strip():
            raise ValueError('parsed cache corruption')
        parsed = json.loads(parsed_raw)
        if parsed.get('sha256') != dep['source_sha256']:
            raise ValueError('parsed cache is not bound to source')
        c['hits'] += 1
        c['cache_bytes_read'] += len(raw) + len(parsed_raw)
    else:
        raw = Path(source).read_bytes()
        if digest(raw) != dep['source_sha256']:
            raise ValueError('admitted source has changed')
        c['local_acquisitions'] += 1
        c['bytes_read'] += len(raw)
        parsed = parse_source(raw, dep['settings'])
        c['parses'] += 1
        if reuse:
            entry.mkdir(exist_ok=False)
            (entry / 'source.blob').write_bytes(raw)
            write(entry / 'parsed.json', parsed)
            (entry / 'parsed.sha256').write_text(digest((entry / 'parsed.json').read_bytes()) + '\n')
            write(entry / 'dependency.json', dep)
            for p in entry.iterdir():
                p.chmod(0o444)
            entry.chmod(0o555)
    elapsed = time.monotonic() - t0
    c['warm_seconds' if hit else 'cold_seconds'] += elapsed
    c['events'].append({'key': key, 'cache_hit': hit, 'elapsed_seconds': elapsed,
                        'source_sha256': dep['source_sha256'], 'network_fetch': False})
    write(counters, c)
    return parsed


def repo_map(root, commit, destination):
    root = Path(root).resolve()
    effective = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
    if effective != commit:
        raise ValueError('repository commit not pinned')
    paths = subprocess.check_output(['git', '-C', str(root), 'ls-tree', '-r', '--name-only', commit],
                                    text=True).splitlines()
    files = []
    symbol_patterns = [r'^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:fn|struct|enum|trait|mod)\s+(\w+)',
                       r'^\s*(?:async\s+)?(?:def|class)\s+(\w+)',
                       r'^\s*(?:export\s+)?(?:async\s+)?(?:function|class|interface)\s+(\w+)']
    t0 = time.monotonic()
    for name in paths:
        path = root / name
        if path.is_symlink() or not path.is_file() or path.stat().st_size > 2_000_000:
            continue
        # Index committed bytes, never silently read dirty worktree contents at a pinned HEAD.
        raw = subprocess.check_output(['git', '-C', str(root), 'show', commit + ':' + name])
        if b'\0' in raw:
            continue
        text = raw.decode('utf-8', errors='replace')
        symbols = []
        for n, line in enumerate(text.splitlines(), 1):
            for pattern in symbol_patterns:
                m = re.match(pattern, line)
                if m:
                    symbols.append({'name': m.group(1), 'line': n})
                    break
        files.append({'path': name, 'bytes': len(raw), 'sha256': digest(raw), 'lines': len(text.splitlines()),
                      'module': str(Path(name).parent), 'symbols': symbols,
                      'test_path': bool(re.search(r'(^|/)(tests?|specs?)(/|\.)|test_|_test\.', name))})
    result = {'schema': 'er7.repo_map.v1', 'commit': commit, 'files': files,
              'build_seconds': time.monotonic() - t0,
              'limitations': 'Deterministic lexical symbols, not a call graph or semantic source answer.'}
    write(destination, result)
    return result


def reusable(witness, current):
    """Exact dependency equality only; ambiguity never becomes an automatic covered verdict."""
    required = {'finding_sha256', 'source_versions', 'permissions', 'plan_owner_hashes',
                'affected_neighbor_hashes', 'corpus_membership_sha256', 'negative_scope_sha256',
                'applicability', 'comparison_policy', 'instance_binding'}
    if required - witness['dependencies'].keys() or required - current.keys():
        raise ValueError('reuse witness missing dependencies')
    if witness.get('status') != 'verified' or witness.get('semantic_ambiguity') is not False:
        return {'reuse': False, 'reason': 'unverified or semantically ambiguous; candidate adjudication required'}
    changed = sorted(k for k in required if witness['dependencies'][k] != current[k])
    return {'reuse': not changed, 'changed_dependencies': changed,
            'reason': 'exact witnessed dependencies match' if not changed else 'candidate recompare required',
            'result': witness.get('result') if not changed else None}


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest='command', required=True)
    p = sp.add_parser('retain')
    p.add_argument('--source', type=Path, required=True)
    p.add_argument('--retained', type=Path, required=True)
    p.add_argument('--watch-seconds', type=float, default=0)
    p.add_argument('--stop-file', type=Path)
    p = sp.add_parser('render')
    p.add_argument('--source', type=Path, required=True)
    p.add_argument('--report', type=Path, required=True)
    p.add_argument('--history', type=Path, required=True)
    p = sp.add_parser('amendments')
    for flag in ('seed', 'decisions', 'report', 'history'):
        p.add_argument('--' + flag, type=Path, required=True)
    p = sp.add_parser('acquire')
    for flag in ('source', 'dependency', 'cache', 'counters', 'output'):
        p.add_argument('--' + flag, type=Path, required=True)
    p.add_argument('--reuse', action='store_true')
    p = sp.add_parser('repo-map')
    p.add_argument('--root', type=Path, required=True)
    p.add_argument('--commit', required=True)
    p.add_argument('--output', type=Path, required=True)
    p = sp.add_parser('reuse')
    p.add_argument('--witness', type=Path, required=True)
    p.add_argument('--current', type=Path, required=True)
    a = ap.parse_args()
    if a.command == 'retain':
        start, total = time.monotonic(), 0
        while True:
            total += retain_versions(a.source, a.retained)
            if time.monotonic() - start >= a.watch_seconds or (a.stop_file and a.stop_file.exists()):
                break
            time.sleep(0.1)
        result = {'retained': total}
    elif a.command == 'render':
        result = render_versions(a.source, a.report, a.history)
    elif a.command == 'amendments':
        result = render_amendments(a.seed, a.decisions, a.report, a.history)
    elif a.command == 'acquire':
        result = acquire_source(a.source, a.dependency, a.cache, a.counters, a.reuse)
        write(a.output, result)
        result = {'output': str(a.output), 'sha256': result['sha256']}
    elif a.command == 'repo-map':
        m = repo_map(a.root, a.commit, a.output)
        result = {'files': len(m['files']), 'build_seconds': m['build_seconds']}
    else:
        result = reusable(json.loads(a.witness.read_text()), json.loads(a.current.read_text()))
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
