"""Trusted-host, job-scoped Boolean-only projection. No raw text/log hash output."""
import json, os, re, stat
from pathlib import Path

LAB = Path('/home/sittingmongoose/PM-Experiments/external-research-v7-20260930')
MAX_FILE = 64 * 1024 * 1024
MAX_LINE = 4 * 1024 * 1024
EVENTS = {
    'bootstrap.app.startup.plugins.completed': {'pluginCount': int, 'enabledPluginCount': int, 'hookCount': int, 'commandRootCount': int, 'skillRootCount': int},
    'bootstrap.app.startup.config.completed': {'configSourceUser': bool, 'configSourceProject': bool},
    'bootstrap.app.startup.runtime_config.completed': {'memoryEnabled': bool, 'memoryUse': bool, 'memoryExtractionEnabled': bool},
}

def require(ok):
    if not ok:
        raise ValueError('UNKNOWN: context projection rejected')

def nodes(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from nodes(child)

def rows(path):
    require(not any(x.is_symlink() for x in (path, *path.parents)))
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(fd, 'rb') as stream:
        before = os.fstat(stream.fileno())
        require(stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and before.st_uid == os.getuid() and before.st_size <= MAX_FILE)
        total = 0
        while True:
            raw = stream.readline(MAX_LINE + 1)
            if not raw:
                break
            total += len(raw)
            require(total <= MAX_FILE and len(raw) <= MAX_LINE and raw.endswith(b'\n'))
            yield json.loads(raw)
        after = os.fstat(stream.fileno())
        require((before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_ino, after.st_size, after.st_mtime_ns))

def startup_projection(record):
    data = list(nodes(record))
    result = []
    for node in data:
        event = node.get('event')
        if event not in EVENTS:
            continue
        fields = {}
        for key, kind in EVENTS[event].items():
            values = [n[key] for n in data if key in n and type(n[key]) is kind]
            if values and all(v == values[0] for v in values) and (kind is bool or 0 <= values[0] <= 1000000):
                fields[key] = values[0]
        result.append({'event': event, 'fields': fields})
    return result

def marker_projection(record):
    request = record.get('request') or {}
    body = request.get('body')
    require(isinstance(body, dict))
    found = {'agentsMd': False, 'global_user_instructions': False, 'auto_memory': False}
    def inspect(text):
        if isinstance(text, str):
            found['agentsMd'] |= '# agentsMd' in text
            found['global_user_instructions'] |= '(user default instructions):' in text
            found['auto_memory'] |= "(user's auto-memory, persists across conversations):" in text
    for candidate in (body.get('system'),):
        if isinstance(candidate, str):
            inspect(candidate)
        elif isinstance(candidate, list):
            for part in candidate:
                if isinstance(part, dict) and part.get('type') == 'text':
                    inspect(part.get('text'))
    for candidate in (body.get('messages'), request.get('messages'), request.get('sdkMessages')):
        if isinstance(candidate, list):
            for message in candidate:
                parts = message.get('content') if isinstance(message, dict) else None
                if isinstance(parts, str):
                    inspect(parts)
                elif isinstance(parts, list):
                    for part in parts:
                        if isinstance(part, dict) and part.get('type') == 'text':
                            inspect(part.get('text'))
    return found

def observe(native_root, session_id):
    root = Path(native_root).absolute()
    require(root.parent.parent == LAB / 'ops/productive-z-v1' and root.name == 'native')
    require(isinstance(session_id, str) and re.fullmatch(r'[a-zA-Z0-9_-]{1,100}', session_id))
    require(not any(x.is_symlink() for x in (root, *root.parents)))
    private = root / 'private-client/storage/cli'
    model_file = private / 'rollout' / ('model-io-' + session_id + '.jsonl')
    model_rows = []
    for record in rows(model_file):
        require(record.get('sessionId') == session_id)
        model_rows.append(marker_projection(record))
    startup = []
    for path in sorted((private / 'log').glob('zcode-????-??-??.jsonl')):
        require(re.fullmatch(r'zcode-[0-9]{4}-[0-9]{2}-[0-9]{2}\.jsonl', path.name))
        for record in rows(path):
            startup.extend(startup_projection(record))
    config = [r['fields'] for r in startup if r['event'] == 'bootstrap.app.startup.config.completed']
    features = [r['fields'] for r in startup if r['event'] == 'bootstrap.app.startup.runtime_config.completed']
    plugins = [r['fields'] for r in startup if r['event'] == 'bootstrap.app.startup.plugins.completed']
    qualified = bool(model_rows and config and features and plugins)
    qualified &= all(not any(r.values()) for r in model_rows)
    qualified &= all(r.get('configSourceUser') is False and r.get('configSourceProject') is True for r in config)
    qualified &= all(r.get('memoryUse') is False and r.get('memoryEnabled') is False for r in features)
    qualified &= all(all(r.get(k) == 0 for k in ('pluginCount', 'enabledPluginCount', 'hookCount', 'commandRootCount', 'skillRootCount')) for r in plugins)
    return {'schema': 'er7.future_native_context.observations.v1', 'status': 'qualified' if qualified else 'unestablished', 'model_attempts_observed': len(model_rows), 'instruction_marker_booleans': model_rows, 'startup': startup, 'raw_text_hash_or_copy': False, 'semantic_findings_inspected': False, 'scope': 'Configured route closure plus observed instruction-marker absence; no blanket all-memory-machinery-disabled claim'}
