#!/usr/bin/env python3
"""Regenerate DELIVERY_MANIFEST.json from what is actually on disk.

The manifest is a companion file, so it must describe the build that exists
right now. Hand-maintaining its hashes is how it went stale: it named a build
digest that `build.py --check` no longer produced, which is exactly the drift
CONCEPT-016 forbids. Everything below is read from the filesystem or from a
report a harness wrote; nothing is asserted by hand.

    python3 reports/build-delivery-manifest.py
"""
import hashlib, json, pathlib, subprocess, datetime, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'DELIVERY_MANIFEST.json'

SKIP_DIRS = {'node_modules', '.git', 'evidence', 'handoff'}
SKIP_SUFFIX = {'.zip', '.mov', '.png', '.webm', '.mp4'}


def tracked():
    for p in sorted(ROOT.rglob('*')):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT)
        if set(rel.parts) & SKIP_DIRS or str(rel).replace('\\', '/').startswith('tests/tmp'):
            continue
        if p.suffix.lower() in SKIP_SUFFIX:
            continue
        yield rel, p


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


check = subprocess.run([sys.executable, 'build.py', '--check'], cwd=ROOT,
                       capture_output=True, text=True)
m = re.search(r'sha256 ([0-9a-f]+)', check.stdout)
build_digest = m.group(1) if m else None
build_ok = check.returncode == 0

audit_path = ROOT / 'reports' / 'independent-audit-v5.json'
audit = json.loads(audit_path.read_text(encoding='utf-8')) if audit_path.exists() else None

files = [{'path': str(rel).replace('\\', '/'), 'bytes': p.stat().st_size, 'sha256': sha(p)}
         for rel, p in tracked()]

manifest = {
    'name': 'Puppet Master Assistant Chat 5.6 Pro',
    'generatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'repoRelativePath': 'Concepts/chat-assistant-concepts/5.6 Pro',
    'generatedBy': 'reports/build-delivery-manifest.py — every hash below is read from disk',
    'build': {
        'checkPassed': build_ok,
        'digest': build_digest,
        'rule': 'both deliverables are regenerated from build.py and byte-checked; generated HTML is never hand-edited',
        'outputs': ['index.html', 'PM_Chat_Assistant_5.6_Pro_Standalone.html'],
    },
    'certification': (
        'NOT CERTIFIED — see reports/AUDIT_MATRIX.md. Concept behaviour is audited per requirement; '
        'canonical and native readiness are separate columns and neither is closed here.'
    ),
    'audit': None,
    'correction': {
        'packet': 'PM_Assistant_v2_Additive_Correction_v4',
        'scope': 'additive to the implemented v2 branch; non-conflicting v2 work, 5.6 Pro defaults and Chat updates.md preserved',
        'buildRule': 'both outputs regenerated from build.py twice and byte-checked; generated HTML is never hand-edited',
        'proofBoundary': (
            'fixture-backed concept behaviour is not native handler, storage, provider, scheduler or '
            'recovery proof. Every cmd.* named in this concept is handler_unavailable.'
        ),
        'renamedTests': [{
            'from': 'tests/todo-verify.mjs',
            'to': 'tests/todo-runtime-verify.mjs',
            'reason': 'the old name implied a To-Do verification status; validation remains an ordinary To-Do (TDG-014, CONCEPT-015)',
        }],
        'newTests': ['tests/correction-v4-verify.mjs', 'tests/independent-audit-v5.mjs'],
    },
    'files': files,
}

if audit:
    c = audit['requirement_counts']
    unclosed = sorted(r['id'] for r in audit['requirements']
                      if r['verdict'] in ('failed', 'not_implemented'))
    manifest['audit'] = {
        'report': 'reports/AUDIT_MATRIX.md',
        'machine': 'reports/independent-audit-v5.json',
        'harness': 'tests/independent-audit-v5.mjs',
        'generated': audit['generated'],
        'requirements': audit['requirements_decided'],
        'probes': audit['probes_total'],
        'consoleErrors': len(audit['console_errors']),
        'counts': c,
        'unclosed': unclosed,
        'blocked': sorted(r['id'] for r in audit['requirements'] if r['verdict'] == 'blocked'),
        'superseded': sorted(f"{r['id']} -> {r.get('superseded_by')}" for r in audit['requirements']
                             if r['verdict'] == 'superseded'),
    }
    if not unclosed:
        manifest['certification'] = (
            'CONCEPT AUDIT CLOSED — every one of '
            f"{audit['requirements_decided']} v2 and correction requirements is decided, with "
            f"{c.get('blocked', 0)} recorded blocked on native infrastructure and "
            f"{c.get('superseded', 0)} superseded by the correction. "
            'Canonical and native readiness remain open and are reported separately.'
        )

OUT.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + '\n',
               encoding='utf-8', newline='\r\n')
print(f'Wrote DELIVERY_MANIFEST.json — {len(files)} files, build {build_digest}, '
      f"audit {'present' if audit else 'MISSING'}.")
