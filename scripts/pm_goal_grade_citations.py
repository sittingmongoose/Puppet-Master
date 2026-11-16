"""Exact current or path@full-commit bytes for PNC-019 evidence citations."""
from __future__ import annotations

import hashlib
from pathlib import Path, PurePosixPath
import re
import subprocess


def citation_bytes(root, citation):
    path, separator, commit = citation.rpartition('@')
    if not separator:
        path, commit = citation, None
    elif not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('historical citation requires a full commit SHA')
    parts = PurePosixPath(path)
    if parts.is_absolute() or not path or any(p in ('..', '.git') for p in parts.parts):
        raise ValueError('citation path must stay inside the repository')
    if commit is None:
        return (Path(root) / path).read_bytes()
    result = subprocess.run(['git', '-C', str(root), 'cat-file', 'blob', commit + ':' + path],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode:
        raise ValueError('historical citation blob is unavailable')
    return result.stdout


def citation_lines(root, citation):
    raw = citation_bytes(root, citation)
    return hashlib.sha256(raw).hexdigest(), raw.decode('utf-8').split('\n')


def evidence_problems(root, evidence, files):
    """Verify historical evidence with exactly the current-evidence checks."""
    path = evidence['path']
    try:
        if path not in files:
            files[path] = citation_lines(root, path)
        file_sha, lines = files[path]
    except (OSError, ValueError) as error:
        return [f'cannot read {path}: {error}']
    start, end = evidence['line_start'], evidence['line_end']
    if type(start) is not int or type(end) is not int or not 1 <= start <= end <= len(lines):
        return [f'line range {path}']
    excerpt = '\n'.join(lines[start - 1:end])
    problems = []
    if evidence['quote'] not in excerpt:
        problems.append(f'quote not at {path}:{start}-{end}')
    elif hashlib.sha256(excerpt.encode()).hexdigest() != evidence['excerpt_sha256']:
        problems.append(f'excerpt hash {path}:{start}')
    if file_sha != evidence['file_sha256']:
        problems.append(f'file hash {path}')
    return problems
