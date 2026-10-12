#!/usr/bin/env python3
"""Explicit-list public copier and bounded content/metadata privacy scan."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

PATTERNS = {
    'private_email': r'(?<![\w.+-])[\w.+-]+@(?!users\.noreply\.github\.com\b|example\.(?:com|org|net)\b)[\w.-]+\.[A-Za-z]{2,}',
    'credential': r'(?i)(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._-]{12,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)',
    'local_path': r'(?:/home/[A-Za-z0-9_.-]+/[^\s"\x27]+|/Users/[A-Za-z0-9_.-]+/[^\s"\x27]+|/mnt/Cursor/[A-Za-z0-9_.-]+[^\s"\x27]*|[A-Za-z]:\\Users\\[^\s"\x27]+)',
    'machine_address': r'\b(?:192\.168\.(?:\d{1,3}\.)\d{1,3}|10\.(?:\d{1,3}\.){2}\d{1,3})\b',
    'credential_assignment': r'(?i)(?:api[_-]?key|access[_-]?token|refresh[_-]?token|password)\s*[=:]\s*["\x27]?[A-Za-z0-9_./+-]{12,}',
}
# Never echo matching secret text into diagnostics.
def scan_text(value, label, allow=(), deny=()):
    findings = []
    for token in allow:
        value = value.replace(token, '[APPROVED]')
    for name, pattern in PATTERNS.items():
        for m in re.finditer(pattern, value):
            findings.append({'file': label, 'kind': name, 'line': value.count('\n', 0, m.start()) + 1})
    for token in deny:
        if token and token in value:
            findings.append({'file': label, 'kind': 'private_literal', 'line': None})
    return findings

def relative(root, name):
    p = Path(name)
    if p.is_absolute() or '..' in p.parts or not p.parts or '\\' in name:
        raise ValueError('paths must be normalized relative POSIX paths')
    # Reject symlinks in every component, including dangling ones.
    cursor = root
    for part in p.parts:
        cursor /= part
        if cursor.is_symlink():
            raise ValueError('symlink refused')
    return root / p

def denied(name):
    low = name.lower()
    return any(x in low for x in ('native-transcript', 'native_transcript', 'transcript.json', 'transcript.jsonl', '.sqlite', '.git/', 'credentials', 'auth.json'))

def load_policy(path):
    return json.loads(Path(path).read_text()) if path else {}

def main():
    a = argparse.ArgumentParser(description=__doc__)
    a.add_argument('command', choices=['copy', 'scan', 'metadata'])
    a.add_argument('--root', required=True, type=Path)
    a.add_argument('--list', type=Path, help='JSON list of relative file names, or explicit copy manifest')
    a.add_argument('--destination', type=Path)
    a.add_argument('--policy', help='PRIVATE JSON: replacements object, approved_literals, private_literals')
    a.add_argument('--revision', help='one exact commit to inspect; omitted: effective prospective identity')
    args = a.parse_args()
    policy = load_policy(args.policy)
    root = args.root.resolve()
    allow, deny = policy.get('approved_literals', []), policy.get('private_literals', [])
    if args.command == 'metadata':
        if args.revision:
            if not re.fullmatch(r'[a-fA-F0-9]{40}|[a-fA-F0-9]{64}', args.revision):
                raise ValueError('one full immutable commit hash required')
            value = subprocess.check_output(['git', '-C', str(root), 'show', '-s', '--format=%an%n%ae%n%cn%n%ce', args.revision], text=True)
        else:
            value = '\n'.join(subprocess.check_output(['git', '-C', str(root), 'var', var], text=True) for var in ('GIT_AUTHOR_IDENT', 'GIT_COMMITTER_IDENT'))
        findings = scan_text(value, 'git-identity', allow, deny)
        # Approved no-reply name/email must be supplied explicitly; no global config changes.
        if not allow or not any('@users.noreply.github.com' in x for x in allow):
            findings.append({'file': 'git-identity', 'kind': 'approved_no_reply_not_supplied', 'line': None})
        emails = re.findall(r'[\w.+-]+@[\w.-]+', value)
        if len(emails) != 2 or any(e not in allow for e in emails):
            findings.append({'file': 'git-identity', 'kind': 'unapproved_identity', 'line': None})
        print(json.dumps({'findings': findings}, indent=2))
        return int(bool(findings))
    if not args.list:
        a.error('--list is required; recursive discovery is deliberately unsupported')
    listing = json.loads(args.list.read_text())
    entries = listing.get('files', []) if isinstance(listing, dict) else listing
    findings, prepared = [], []
    targets = set()
    for entry in entries:
        item = {'source': entry, 'target': entry} if isinstance(entry, str) else entry
        source, target = item['source'], item.get('target', item['source'])
        relative(root, target)
        if target == 'public-manifest.json':
            raise ValueError('reserved manifest target')
        if target in targets:
            raise ValueError('duplicate public target')
        targets.add(target)
        if denied(source) or denied(target) or item.get('kind') == 'raw_native_transcript':
            raise ValueError('raw transcript/credential/database publication refused')
        p = relative(root, source)
        raw = p.read_bytes()
        original_hash = hashlib.sha256(raw).hexdigest()
        if item.get('sha256') and original_hash != item['sha256']:
            raise ValueError('source hash mismatch')
        try:
            value = raw.decode('utf-8')
        except UnicodeDecodeError:
            raise ValueError('binary requires separate reviewed exporter; opaque copy refused')
        if args.command == 'copy':
            for before, after in sorted(policy.get('replacements', {}).items(), key=lambda x: -len(x[0])):
                if not before:
                    raise ValueError('empty replacement refused')
                value = value.replace(before, after)
        findings += scan_text(target + '\n' + value, target, allow, deny)
        # Catch native conversational envelopes even under renamed files.
        if re.search(r'"role"\s*:\s*"(?:assistant|user|system|tool)"', value) and re.search(r'"(?:messages|content|tool_calls)"\s*:', value):
            findings.append({'file': target, 'kind': 'possible_raw_transcript', 'line': None})
        prepared.append((target, value.encode(), original_hash, item.get('kind', 'authored')))
    if findings:
        print(json.dumps({'findings': findings}, indent=2))
        return 1
    if args.command == 'scan':
        print(json.dumps({'files_checked': len(prepared), 'findings': []}))
        return 0
    if not args.destination:
        a.error('--destination is required for copy')
    # New directory only; never modify private originals or prior public editions.
    args.destination.mkdir(parents=True, exist_ok=False)
    manifest = []
    for target, data, old_hash, kind in prepared:
        dest = relative(args.destination, target)
        dest.parent.mkdir(parents=True, exist_ok=True)
        with dest.open('xb') as f:
            f.write(data)
        manifest.append({'path': target, 'kind': kind, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'source_sha256': old_hash, 'normalized': old_hash != hashlib.sha256(data).hexdigest()})
    with (args.destination / 'public-manifest.json').open('x') as f:
        json.dump({'schema': 'er13.public_manifest.v1', 'files': manifest}, f, indent=2)
        f.write('\n')
    print(json.dumps({'copied': len(manifest), 'findings': []}))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
