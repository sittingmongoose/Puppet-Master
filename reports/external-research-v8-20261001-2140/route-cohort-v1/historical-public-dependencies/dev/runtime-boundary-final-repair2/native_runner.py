"""Z-only native Goal reuse; all model-visible actions are bounded MCP calls."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import queue
import subprocess
import sys
import threading
import time
from boundary import allowlist, mcp_config
from admission import validate_admission

HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
NATIVE = LAB / 'dev/harness-v1-frozen/native'
sys.path.insert(0, str(NATIVE))
import zcode_goal_driver as zg
import zcode_native as zn
spec = importlib.util.spec_from_file_location('safe_frozen_goal', NATIVE / 'run_goal.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
CLI_SHA = 'e9f1868c0fdb863537ed910ee3828b9be96b8c2fd805473f63b439e1113266b8'
WORKSPACE = None
PUBLIC_GET = False
INSTANCES = []
HOST_SECONDS = 480


def approved_registry(path, requested_model):
    # Same official desktop projection, with a NONSECRET prospective revision.
    # No secret-bearing request is logged or hashed, including on error.
    provider_id, model_id = requested_model.split('/', 1)
    if (provider_id, model_id) != ('builtin:zai-coding-plan', 'GLM-5.3-Flash'):
        raise ValueError('selected Coding Plan route only')
    source = json.loads(Path(path).read_text())['provider'][provider_id]
    options = source.get('options', {})
    if source.get('kind') != 'anthropic' or source.get('enabled') is not True or options.get('baseURL', '').rstrip('/') != 'https://api.z.ai/api/anthropic':
        raise ValueError('approved provider mismatch')
    credential = options.get('apiKey', '').strip()
    if not credential: raise ValueError('existing authorized credential missing')
    zn.SECRET_VALUES.add(credential)
    m = source['models'][model_id]
    levels = m.get('reasoning', {}).get('variants', [])
    if not m.get('reasoning', {}).get('enabled') or 'max' not in levels: raise ValueError('max reasoning unavailable')
    model = {'modelId': model_id, 'label': m.get('name', model_id), 'contextWindow': m['limit']['context'],
             'maxOutputTokens': m['limit']['output'], 'providerOptions': {'supportedFormats': ['anthropic-messages']},
             'reasoning': {'enabled': True, 'levels': [{'value': v, 'label': v.capitalize()} for v in levels],
                           'defaultLevel': m['reasoning'].get('defaultVariant', levels[0])}}
    if any(k in m.get('modalities', {}).get('input', []) for k in ('image', 'pdf', 'video')):
        for k, field in [('image','supportsImages'), ('pdf','supportsPdf'), ('video','supportsVideo')]: model[field] = k in m['modalities']['input']
    provider = {'providerId': provider_id, 'kind': 'anthropic', 'apiFormat': 'anthropic-messages', 'source': 'builtin',
                'label': source['name'], 'baseURL': 'https://api.z.ai/api/anthropic',
                'apiKey': {'source': 'inline', 'value': credential}, 'apiKeyRequired': options.get('apiKeyRequired', True),
                'models': [model], 'providerOptions': {'endpoints': {'baseURL': 'https://api.z.ai/api/anthropic', 'paths': {'anthropic': '/v1/messages'}},
                                                     'apiFormat': 'anthropic-messages', 'modelSupportedFormats': {}}}
    # Existing custom provider headers, if any, stay only in the native control
    # request's memory. The sanitizer removes all header objects from logs.
    if source.get('headers'):
        headers = source['headers']
        if not isinstance(headers, dict) or any(not isinstance(k,str) or not isinstance(v,str) or '\n' in k+v or '\r' in k+v for k,v in headers.items()): raise ValueError('invalid native provider headers')
        zn.SECRET_VALUES.update(v for v in headers.values() if v)
        provider['headers'] = headers
    return {'generatedAt': int(time.time()*1000), 'revision': 'pm-z-safe-final-repair2', 'providers': [provider]}


def metadata(root):
    # Metadata only; do not read/hash host credentials/configuration/history.
    root = Path(root)
    return {str(p.relative_to(root)): [s.st_size, s.st_mtime_ns, s.st_ino]
            for p in root.rglob('*') if p.is_file() and not p.is_symlink()
            for s in [p.stat()]}


class SafeSink:
    def __init__(self, path, stderr=False):
        self.f = Path(path).open('a')
        self.stderr = stderr
        self.model_events = []
    def write(self, line):
        if self.stderr:
            self.f.write('[native stderr omitted]\n'); return
        try: value = json.loads(line)
        except Exception: value = {'unparsed_native_output': 'omitted'}
        if isinstance(value,dict) and value.get('method') == 'v4/telemetry/event':
            e = value.get('params') or {}
            if e.get('kind') == 'model.request.status':
                self.model_events.append({k:e.get(k) for k in ('requestId','attempt','status','modelId','providerId','sessionId')})
        self.f.write(json.dumps(zn.sanitized(value)) + '\n')
    def flush(self): self.f.flush()
    def close(self): self.f.close()


class SafeProtocol(zg.Protocol):
    def __init__(self, out_dir):
        if hashlib.sha256(zg.CLI.read_bytes()).hexdigest() != CLI_SHA:
            raise RuntimeError('selected native executable drift')
        self.responses, self.write_lock = queue.Queue(), threading.Lock()
        self.attention, self.next_id, self.pending = None, 1, {}
        self.out_dir = out_dir
        self.host_before = metadata('/home/sittingmongoose/.zcode')
        self.private = out_dir / 'private-client'
        self.private.mkdir(mode=0o700)
        storage = self.private / 'storage'
        self.settings = self.private / 'settings.json'
        # Supported native schema fields; no credential/provider/retry override.
        self.settings.write_text(json.dumps({'storage': {'dir': str(storage), 'sessionDbPath': str(storage / 'cli/db/db.sqlite')},
            'plugins': {'enabled': False, 'dirs': []}, 'skills': {'enabled': False, 'includeInstructions': False, 'roots': []},
            'hooks': {'enabled': False}, 'memory': {'use': False},
            'features': {'subagent': False, 'memory': False, 'skill': False, 'mcp': True},
            'mcp': {'servers': {}}, 'permission': {'mode':'build','allowedTools':allowlist(PUBLIC_GET), 'disallowedTools':[], 'autoApproveHighRisk':False, 'allowMediumRiskInAuto':False}}) + '\n')
        # Selected app-server rejects --settings despite the global CLI help.
        # Use its supported discovered project config, protected from MCP writes.
        policy_dir = Path(WORKSPACE) / '.zcode'
        policy_dir.mkdir(exist_ok=False)
        (policy_dir / 'config.json').write_bytes(self.settings.read_bytes())
        personal = self.private / 'personal-provider.json'
        personal.write_text('{"providerRules":[]}\n')
        self.out_file = SafeSink(out_dir / 'zcode-stdout.redacted.jsonl')
        self.err_file = SafeSink(out_dir / 'zcode-stderr.omitted.log', True)
        env = os.environ.copy()
        for k in list(env):
            if any(v in k.upper() for v in ('API_KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'CREDENTIAL')):
                env.pop(k)
        env['ZCODE_BUILTIN_PROVIDER_CONFIG_FILE'] = str(zg.BUILTIN)
        env['ZCODE_PERSONAL_PROVIDER_CONFIG_FILE'] = str(personal)
        # Installed gxe() explicitly recognizes these storage controls.
        env['ZCODE_STORAGE_DIR'] = str(storage)
        env['ZCODE_LOG_DIR'] = str(storage / 'cli/log')
        env['ZCODE_SESSION_DB_PATH'] = str(storage / 'cli/db/db.sqlite')
        watch_read, self.watch_write = os.pipe()
        self.proc = subprocess.Popen([sys.executable, '-I', '-B', str(HERE / 'host_guard.py'), str(watch_read), str(HOST_SECONDS), str(out_dir / 'host-process.json'), str(zg.CLI), str(WORKSPACE)],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1,
            env=env, cwd=WORKSPACE, start_new_session=True, pass_fds=(watch_read,))
        os.close(watch_read)
        INSTANCES.append(self)
        try:
            threading.Thread(target=self._stdout, daemon=True).start()
            threading.Thread(target=self._stderr, daemon=True).start()
        except BaseException:
            os.close(self.watch_write)
            self.proc.wait(timeout=3)
            raise

    def close(self):
        try: super().close()
        finally:
            try: os.close(self.watch_write)
            except OSError: pass

    def call(self, method, params, timeout=45):
        if method == 'session/create':
            params = {**params, 'toolAllowlist': allowlist(PUBLIC_GET),
                      'mcpServers': [mcp_config(WORKSPACE, PUBLIC_GET)]}
            (self.out_dir / 'session-tool-contract.json').write_text(json.dumps({
                'mode': params['mode'], 'toolAllowlist': params['toolAllowlist'],
                'mcpServers': params['mcpServers'], 'effective_inventory': 'pending actual native model requests'}, indent=2) + '\n')
        # Registry request stays only in host memory; never log raw or hash it.
        return super().call(method, params, timeout)


def inventory(private, expected, telemetry_requests, model_events):
    rows, keys = [], set()
    for path in sorted(Path(private).rglob('model-io-*.jsonl')):
        for line in path.read_text().splitlines():
            obj = json.loads(line)
            body = (obj.get('request') or {}).get('body')
            key = (obj.get('requestId'), obj.get('attempt'))
            duplicate = key in keys
            keys.add(key)
            tools = body.get('tools', []) if isinstance(body,dict) else None
            names = [t.get('name', t.get('function',{}).get('name')) for t in tools] if isinstance(tools,list) and all(isinstance(t,dict) for t in tools) else None
            model = body.get('model') if isinstance(body,dict) else None
            safe = names is not None and all(n in expected for n in names) and str(model).lower() == 'glm-5.3-flash' and not duplicate
            rows.append({'request_id':key[0], 'attempt':key[1], 'session_id':obj.get('sessionId'), 'model':model,
                         'tool_names':names, 'duplicate_request_attempt':duplicate,
                         'status':'exact-allowed-subset' if safe else 'missing-invalid-or-unsafe-inventory'})
    covered, required = {r['request_id'] for r in rows}, set(telemetry_requests)
    attempts = {(e['requestId'],e['attempt']) for e in model_events if e['status'] in ('model_request_started','model_request_completed','model_request_failed','model_stream_stalled')}
    missing_attempts = attempts-keys
    unexpected_attempts = keys-attempts
    identities_ok = all(e.get('providerId') == 'builtin:zai-coding-plan' and str(e.get('modelId')).lower() == 'glm-5.3-flash' for e in model_events)
    return {'rows':rows, 'expected':expected, 'telemetry_request_statuses':telemetry_requests,
            'missing_request_ids':sorted(required-covered), 'unreported_request_ids':sorted(covered-required),
            'missing_request_attempts':[list(x) for x in sorted(missing_attempts)], 'unreported_request_attempts':[list(x) for x in sorted(unexpected_attempts)],
            'native_model_status_events':model_events,
            'verified':bool(attempts) and bool(required) and covered == required and not missing_attempts and not unexpected_attempts and identities_ok and all(r['status']=='exact-allowed-subset' for r in rows),
            'effort_proof':'mandatory native session/read max identity; unchanged native Goal verifier same defaultModelRef',
            'scope':'Exact request-ID set including started/unfinished/failed/verifier IDs; distinct attempt records required. No row-count substitute.'}


def main():
    global WORKSPACE, PUBLIC_GET, HOST_SECONDS
    p = argparse.ArgumentParser()
    p.add_argument('--workspace', type=Path, required=True)
    p.add_argument('--prompt-file', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--label', required=True)
    p.add_argument('--max-seconds', type=float, required=True)
    p.add_argument('--max-responses', type=int, required=True)
    p.add_argument('--public-get', action='store_true')
    p.add_argument('--mode', choices=('canary','productive'), required=True)
    p.add_argument('--admission-file', type=Path, required=True)
    a = p.parse_args()
    admission = validate_admission(a, HERE, LAB)
    WORKSPACE, PUBLIC_GET, HOST_SECONDS = a.workspace.resolve(strict=True), a.public_get, a.max_seconds
    a.workspace, a.app, a.zcode_tools = WORKSPACE, 'zcode', allowlist(PUBLIC_GET)
    a.start_epoch, a.start_monotonic = time.time(), time.monotonic()
    a.out.mkdir(parents=True, exist_ok=False, mode=0o700)
    objective = a.prompt_file.read_text().strip()
    if objective.startswith('/goal\n'): objective = objective.split('\n', 1)[1]
    receipt = {'app': 'zcode', 'fresh_session': True, 'requested_model': 'GLM-5.3-Flash', 'requested_effort': 'max',
               'native_goal_entry': 'unchanged session/goal set and native automatic continuation/verifier',
               'host_auth': 'existing desktop Coding Plan registry projected in memory; not mounted in MCP child',
               'canary_qualification': 'not yet established', 'admission_mode':a.mode, 'runtime_snapshot_sha256':admission['runtime_snapshot_sha256'], 'accepted_method_sha256':admission['method_sha256']}
    rc = 1
    original = zg.Protocol
    original_registry = zg.desktop_registry
    zg.Protocol = SafeProtocol
    zg.desktop_registry = approved_registry
    # No custom prompt loop; the original driver owns native activation, waits,
    # counters, caps, automatic native continuations and bounded process cleanup.
    import signal
    signal.signal(signal.SIGALRM, engine.cap_alarm)
    signal.setitimer(signal.ITIMER_REAL, max(.1, a.max_seconds - 30))
    try:
        engine.run_zcode(a, objective, a.out, receipt)
        rc = 0
    except Exception as exc:
        receipt['driver_error'] = type(exc).__name__  # no raw auth-bearing native error
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        zg.Protocol = original
        zg.desktop_registry = original_registry
        if INSTANCES:
            host = INSTANCES[-1]
            process_record = a.out / 'host-process.json'
            groups = [host.proc.pid]
            if process_record.exists(): groups.append(json.loads(process_record.read_text())['native_host_pgid'])
            receipt['quiescence_groups'] = {str(g):engine.group_members(g) for g in groups}
            if any(receipt['quiescence_groups'].values()): rc = 1
            checked = inventory(host.private, allowlist(PUBLIC_GET), getattr(host, 'req', {}), host.out_file.model_events)
            receipt['inventory_check'] = checked
            after = metadata('/home/sittingmongoose/.zcode')
            changes = [k for k in set(host.host_before) | set(after) if host.host_before.get(k) != after.get(k)]
            receipt['shared_native_metadata_changed_paths'] = changes
            if changes or not checked['verified']: rc = 1
        receipt['startup_cleanup_elapsed_seconds'] = round(time.monotonic() - a.start_monotonic, 3)
        receipt['canary_qualification'] = 'passed' if rc == 0 and receipt.get('goal_status_final') == 'complete' else 'failed-or-unestablished'
        receipt['component_outcome'] = 'passed' if rc == 0 and receipt.get('goal_status_final') == 'complete' else 'failed-or-unestablished'
        (a.out / 'receipt.json').write_text(json.dumps(zn.sanitized(receipt), indent=2) + '\n')
    return rc


if __name__ == '__main__': sys.exit(main())
