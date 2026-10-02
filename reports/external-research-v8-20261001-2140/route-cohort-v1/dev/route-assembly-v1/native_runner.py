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
from admission import validate_admission, ACTIVE
import projector

HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
NATIVE = HERE
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


class SafeSink:
    """No native stdout/stderr record is ever copied, hashed or emitted."""
    def __init__(self, path, stderr=False):
        self.stderr = stderr
        self.model_events = []
        self.structural = projector.structural_empty()
    def write(self, line):
        if self.stderr: return
        try:
            value = json.loads(line)
            projector.structural_update(value,self.structural,allowlist(PUBLIC_GET))
            row = projector.telemetry(value)
            if row is not None: self.model_events.append(row)
        except Exception:
            self.model_events.append({'requestId':'INVALID','attempt':0,'status':'model_request_failed',
                                      'sessionId':'INVALID','providerId':'MISMATCH','modelId':'MISMATCH'})
    def flush(self): pass
    def close(self): pass


class SafeProtocol(zg.Protocol):
    def __init__(self, out_dir):
        if hashlib.sha256(zg.CLI.read_bytes()).hexdigest() != CLI_SHA:
            raise RuntimeError('selected native executable drift')
        self.responses, self.write_lock = queue.Queue(), threading.Lock()
        self.attention, self.next_id, self.pending = None, 1, {}
        self.out_dir = out_dir
        self.private = out_dir / 'private-client'
        self.private.mkdir(mode=0o700)
        storage = self.private / 'storage'
        self.settings = self.private / 'settings.json'
        self.home = self.private / 'home'
        self.home.mkdir(mode=0o700)
        self.xdg = {}
        for name in ('config','cache','data','state'):
            self.xdg[name] = self.private / ('xdg-' + name)
            self.xdg[name].mkdir(mode=0o700)
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
        env = {'PATH':'/home/sittingmongoose/.local/bin:/usr/bin:/bin','LANG':'C.UTF-8',
               'HOME':str(self.home),'USERPROFILE':str(self.home),
               'XDG_CONFIG_HOME':str(self.xdg['config']),'XDG_CACHE_HOME':str(self.xdg['cache']),
               'XDG_DATA_HOME':str(self.xdg['data']),'XDG_STATE_HOME':str(self.xdg['state']),
               'ZCODE_BUILTIN_PROVIDER_CONFIG_FILE':str(zg.BUILTIN),
               'ZCODE_PERSONAL_PROVIDER_CONFIG_FILE':str(personal),
               'ZCODE_STORAGE_DIR':str(storage),'ZCODE_LOG_DIR':str(storage/'cli/log'),
               'ZCODE_SESSION_DB_PATH':str(storage/'cli/db/db.sqlite'),'ZCODE_LOG_CONSOLE':'0'}
        self.local_context = {'fresh_home_empty_before_native':not any(self.home.iterdir()),
                              'fresh_xdg_roots_empty_before_native':all(not any(p.iterdir()) for p in self.xdg.values()),
                              'fresh_owned_storage_before_native':not storage.exists(),
                              'controlled_workspace_ancestor_instructions_absent':True,
                              'legacy_home_context_inherited':False,'all_memory_off_claim':False}
        self.startup_context = None
        self.activation = {'schema':'er8.route.activation-positive.v1','native_activation_observed':False,
                           'native_activation_absent_proof':False}
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
            if params.get('mode') != 'build' or 'importedHistory' in params or 'sessionId' in params:
                raise ValueError('fresh build session required')
        if method == 'session/goal' and params.get('action') == 'set':
            # Actual native startup is positively gated before first Goal/provider
            # call. The supported source preserves extraction=true; no all-off claim.
            self.startup_context = projector.startup(self.private)
            if not all(self.local_context[k] is True for k in ('fresh_home_empty_before_native','fresh_xdg_roots_empty_before_native','fresh_owned_storage_before_native','controlled_workspace_ancestor_instructions_absent')):
                raise ValueError('local context gate failed')
        # Registry requests and protocol replies remain only in native host memory.
        result = super().call(method, params, timeout)
        if method == 'session/goal' and params.get('action') == 'set':
            target = (result.get('snapshot') or {}).get('session', {}).get('target') or {}
            observed = result.get('startedTurn') is True and target.get('status') == 'active'
            self.activation = {'schema':'er8.route.activation-positive.v1',
                               'native_activation_observed':observed,'goal_started_turn':result.get('startedTurn') is True,
                               'native_activation_absent_proof':False,
                               'observed_activation_epoch':time.time_ns()//10**9 if observed else None,
                               'observed_activation_monotonic_ns':time.monotonic_ns() if observed else None}
            if observed:
                self.activation['receipt_id'] = projector.identity(target.get('targetId'))
            (PUBLIC_OUT/'activation.json').write_text(json.dumps(self.activation,indent=2)+'\n')
        return result


def positive_log(out, obj):
    row = {'schema':'er8.route.progress.v1'}
    for key,allowed in (('goal_status',{'active','complete','blocked','paused','budget_limited','usage_limited'}),
                        ('run_state',{'idle','running','busy','waiting'}),('cap',{'cap_seconds','cap_responses'})):
        if obj.get(key) in allowed: row[key] = obj[key]
    if type(obj.get('responses')) is int and obj['responses'] >= 0: row['responses'] = obj['responses']
    print(json.dumps(row), flush=True)
    # Only this positive public progress crosses the assembler boundary.
    with (PUBLIC_OUT/'progress.jsonl').open('a') as handle: handle.write(json.dumps(row)+'\n')

PUBLIC_OUT = None


def main():
    global WORKSPACE, PUBLIC_GET, HOST_SECONDS, PUBLIC_OUT
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
    a.start_monotonic = ACTIVE['binding']['stage_start_monotonic_ns'] / 10**9
    a.start_epoch = time.time() - (time.monotonic() - a.start_monotonic)
    a.out.mkdir(parents=True, exist_ok=False, mode=0o700)
    PUBLIC_OUT = a.out
    private_engine = a.out / 'private-runtime'
    private_engine.mkdir(mode=0o700)
    engine.log = positive_log
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
    remaining = min(ACTIVE['lease']['native_stop_monotonic_ns'] / 10**9, a.start_monotonic + a.max_seconds - 30) - time.monotonic()
    if remaining <= 0: raise ValueError('original stage native budget exhausted')
    signal.setitimer(signal.ITIMER_REAL, remaining)
    try:
        engine.run_zcode(a, objective, private_engine, receipt)
        rc = 0
    except Exception as exc:
        receipt['driver_error'] = type(exc).__name__  # no raw auth-bearing native error
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        zg.Protocol = original
        zg.desktop_registry = original_registry
        result = projector.receipt_projection(receipt)
        result.update({'schema':'er8.route.native-positive-receipt.v1',
                       'admission_mode':a.mode,'runtime_snapshot_sha256':admission['runtime_snapshot_sha256'],
                       'accepted_method_sha256':admission['method_sha256'],
                       'requested_model':'GLM-5.3-Flash','requested_effort':'max',
                       'native_goal_engine_sha256':'cf8302f30404128eee32aff128b1f03a5ea26fcfebedeb54ca662a98b2e2ef31',
                       'fresh_session':True,'native_goal_entry':'native-session-goal-set',
                       'shared_native_metadata_changed_paths':'UNOBSERVED-no-host-inventory',
                       'original_case_start_monotonic_ns':ACTIVE['binding']['case_start_monotonic_ns'],
                       'original_stage_start_monotonic_ns':ACTIVE['binding']['stage_start_monotonic_ns'],
                       'original_native_stop_monotonic_ns':ACTIVE['lease']['native_stop_monotonic_ns'],
                       'original_deadline_monotonic_ns':ACTIVE['lease']['deadline_monotonic_ns'],
                       'elapsed_milliseconds':max(0,int((time.monotonic()-a.start_monotonic)*1000)),
                       'raw_native_record_emitted':False,'raw_file_hash_or_copy':False})
        if INSTANCES:
            host = INSTANCES[-1]
            result['local_context'] = host.local_context
            result['startup_context'] = host.startup_context or {'verified':False}
            result['activation'] = host.activation
            result['native_structure'] = host.out_file.structural
            if host.activation.get('native_activation_observed'):
                result['inclusive_pre_activation_milliseconds'] = max(0,(host.activation['observed_activation_monotonic_ns']-ACTIVE['binding']['stage_start_monotonic_ns'])//10**6)
            process_record = private_engine / 'host-process.json'
            groups = [host.proc.pid]
            if process_record.exists(): groups.append(json.loads(process_record.read_text())['native_host_pgid'])
            remaining_groups = [engine.group_members(g) for g in groups]
            result['quiescence_group_remaining_counts'] = [len(x) for x in remaining_groups]
            result['host_groups_absent'] = not any(remaining_groups)
            if any(remaining_groups): rc = 1
            try:
                checked = projector.inventory(host.private, receipt.get('session_id'), allowlist(PUBLIC_GET), host.out_file.model_events)
            except Exception:
                checked = {'verified':False,'projection_error':True,'raw_file_hash_or_copy':False}
            result['inventory_check'] = checked
            if not checked['verified'] or not result['startup_context'].get('verified'): rc = 1
        else:
            result['inventory_check']={'verified':False}
            result['host_groups_absent']=False
            result['startup_context']={'verified':False}
            result['activation']={'native_activation_observed':False,'native_activation_absent_proof':True}
        result['canary_qualification']='passed' if rc==0 and result.get('goal_status_final')=='complete' else 'failed-or-unestablished'
        result['component_outcome']=result['canary_qualification']
        (PUBLIC_OUT/'receipt.json').write_text(json.dumps(result,indent=2)+'\n')
        (PUBLIC_OUT/'public-metrics.json').write_text(json.dumps(result,indent=2)+'\n')
    return rc


if __name__ == '__main__': sys.exit(main())
