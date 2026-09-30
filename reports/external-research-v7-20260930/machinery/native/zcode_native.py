#!/usr/bin/env python3
"""Drive the installed official ZCode bundled stdio protocol; no client substitution."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import selectors
import signal
import sqlite3
import subprocess
import sys
import threading
import time
from typing import Any


DEFAULT_NODE = '/home/sittingmongoose/.zcode/server/node'
DEFAULT_CLI = '/home/sittingmongoose/.local/opt/zcode/app/resources/glm/zcode.cjs'
DEFAULT_DESKTOP_CONFIG = '/home/sittingmongoose/.zcode/v2/config.json'
SECRET_FIELDS = {'authorization','apikey','api_key','apikeyref','access_token','accesstoken',
                 'refresh_token','refreshtoken','id_token','idtoken','clientsecret','client_secret',
                 'password','cookie','cookies','headers','provideroptions','credential','credentials'}
SECRET_VALUES: set[str] = set()


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sanitized(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: '[redacted]' if key.lower() in SECRET_FIELDS or (key.lower() == 'token' and isinstance(val,str))
                else sanitized(val) for key,val in value.items()}
    if isinstance(value, list):
        return [sanitized(item) for item in value]
    if isinstance(value, str):
        for secret in SECRET_VALUES:
            value = value.replace(secret, '[redacted]')
        value = re.sub(r'(?i)\bBearer\s+[A-Za-z0-9._~+/=-]+', 'Bearer [redacted]', value)
        return re.sub(r'(?i)([?&](?:api_key|apikey|access_token|token|key)=)[^&\s"<>]+', r'\1[redacted]', value)
    return value


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(sanitized(value),indent=2,ensure_ascii=False)+'\n')


class ProtocolError(RuntimeError):
    pass


def desktop_registry(path: Path, requested_model: str) -> dict:
    """Project the approved desktop's GLM configuration into its native registry API.

    This mirrors desktop 3.11.2's openCodeProviderToModelProviderConfig and
    convertModelProviderConfigToZCodeProviderInput for this one provider. The
    credential stays in memory and is sent only to the installed official child.
    """
    provider_id, model_id = requested_model.split('/', 1)
    if provider_id != 'builtin:zai-coding-plan' or model_id not in {'GLM-5.3', 'GLM-5.3-Flash'}:
        raise ProtocolError('Only the explicitly selected official GLM routes are supported')
    source = json.loads(path.read_text())['provider'][provider_id]
    options = source.get('options', {})
    if source.get('kind') != 'anthropic' or source.get('enabled') is not True:
        raise ProtocolError('The desktop Coding Plan provider must be enabled with its existing Anthropic format')
    endpoint = options.get('baseURL', '').strip().rstrip('/')
    if endpoint != 'https://api.z.ai/api/anthropic':
        raise ProtocolError('Desktop endpoint differs from the verified official Z.ai configuration')
    credential = options.get('apiKey', '').strip()
    if not credential:
        raise ProtocolError('No approved Coding Plan credential exists in the desktop configuration')
    SECRET_VALUES.add(credential)
    model = source['models'][model_id]
    reasoning = model.get('reasoning', {})
    variants = reasoning.get('variants', [])
    if not reasoning.get('enabled') or 'max' not in variants:
        raise ProtocolError('Desktop model has no enabled max reasoning variant')
    projected_model = {'modelId': model_id, 'label': model.get('name', model_id),
                       'contextWindow': model['limit']['context'], 'maxOutputTokens': model['limit']['output'],
                       'providerOptions': {'supportedFormats': ['anthropic-messages']},
                       'reasoning': {'enabled': True, 'levels': [{'value': level, 'label': level.capitalize()} for level in variants],
                                     'defaultLevel': reasoning.get('defaultVariant', variants[0])}}
    if any(kind in model.get('modalities', {}).get('input', []) for kind in ['image', 'pdf', 'video']):
        for kind in ['image', 'pdf', 'video']:
            projected_model[{'image': 'supportsImages', 'pdf': 'supportsPdf', 'video': 'supportsVideo'}[kind]] = kind in model['modalities']['input']
    provider = {'providerId': provider_id, 'kind': 'anthropic', 'apiFormat': 'anthropic-messages',
                'source': 'builtin', 'label': source['name'], 'baseURL': endpoint,
                'apiKey': {'source': 'inline', 'value': credential},
                'apiKeyRequired': options.get('apiKeyRequired', True), 'models': [projected_model],
                'providerOptions': {'endpoints': {'baseURL': endpoint, 'paths': {'anthropic': '/v1/messages'}},
                                    'apiFormat': 'anthropic-messages', 'modelSupportedFormats': {}}}
    if source.get('headers'):
        provider['headers'] = source['headers']
    return {'generatedAt': int(time.time()*1000), 'revision': 'desktop-glm-'+sha(json.dumps([provider],sort_keys=True).encode()),
            'providers': [provider]}


class ZCodeProtocol:
    def __init__(self, node: Path, cli: Path, cwd: Path, output: Path):
        self.output = output
        self.messages: list[dict] = []
        self.responses: dict[str,dict] = {}
        self.counter = 0
        self.buffers = {'stdout': b'', 'stderr': b''}
        self.selector = selectors.DefaultSelector()
        self.command = [str(node),str(cli),'app-server','--cwd',str(cwd)]
        # Use the unmodified official CLI/default account configuration. No identity,
        # endpoint, auth, product-version, or billing-surface overrides are injected.
        self.process = subprocess.Popen(self.command,cwd=cwd,stdin=subprocess.PIPE,stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE,start_new_session=True)
        self.selector.register(self.process.stdout,selectors.EVENT_READ,'stdout')
        self.selector.register(self.process.stderr,selectors.EVENT_READ,'stderr')
        self.wire = (output/'protocol.redacted.jsonl').open('a')
        self.stderr = (output/'stderr.redacted.log').open('a')

    def send(self, message: dict) -> None:
        raw=(json.dumps(message,ensure_ascii=False)+'\n').encode()
        self.wire.write(json.dumps({'at':utc(),'direction':'out','raw_sha256':sha(raw),'message':sanitized(message)},ensure_ascii=False)+'\n')
        self.wire.flush()
        self.process.stdin.write(raw); self.process.stdin.flush()

    def poll(self, seconds: float=0.1) -> list[dict]:
        received=[]
        for key,_ in self.selector.select(seconds):
            stream=key.data
            raw=os.read(key.fileobj.fileno(),1024*1024)
            if not raw:
                self.selector.unregister(key.fileobj)
                continue
            self.buffers[stream]+=raw
            while b'\n' in self.buffers[stream]:
                line,self.buffers[stream]=self.buffers[stream].split(b'\n',1)
                if stream=='stderr':
                    self.stderr.write(sanitized(line.decode(errors='replace'))+'\n'); self.stderr.flush()
                    continue
                try: message=json.loads(line)
                except ValueError:
                    self.wire.write(json.dumps({'at':utc(),'direction':'in','raw_sha256':sha(line+b'\n'),'parse_error':True,'text':sanitized(line.decode(errors='replace'))})+'\n'); self.wire.flush()
                    continue
                self.wire.write(json.dumps({'at':utc(),'direction':'in','raw_sha256':sha(line+b'\n'),'message':sanitized(message)},ensure_ascii=False)+'\n'); self.wire.flush()
                if 'id' in message and 'method' in message:
                    self.answer_host_request(message)
                elif 'id' in message:
                    self.responses[str(message['id'])]=message
                else:
                    self.messages.append(message)
                received.append(message)
        return received

    def answer_host_request(self, message: dict) -> None:
        if message['method']=='session/requestRuntimePreferences':
            self.send({'id':message['id'],'result':{
                'nativeSearchEnhancementsEnabled':True,'memoryEnabled':False,
                'askUserQuestionAutoResolutionEnabled':False,'modelContextBudgetStrategy':'preflight-v1'}})
        else:
            self.send({'id':message['id'],'error':{'code':-32601,'message':'Host capability not enabled in this controlled research run'}})

    def request(self, method: str, params: dict, timeout: float=45) -> Any:
        self.counter+=1; request_id='research-host-'+str(self.counter)
        self.send({'id':request_id,'method':method,'params':params})
        deadline=time.monotonic()+timeout
        while request_id not in self.responses:
            self.poll(min(0.2,max(0,deadline-time.monotonic())))
            if self.process.poll() is not None:
                raise ProtocolError('ZCode exited before responding to '+method)
            if time.monotonic()>=deadline:
                raise ProtocolError('ZCode response timeout: '+method)
        response=self.responses.pop(request_id)
        if 'error' in response:
            raise ProtocolError(method+': '+json.dumps(sanitized(response['error'])))
        return response['result']

    def close(self) -> dict:
        try:
            self.process.stdin.close()
            deadline=time.monotonic()+6
            while self.process.poll() is None and time.monotonic()<deadline:
                self.poll(0.1)
            if self.process.poll() is None:
                os.killpg(self.process.pid,signal.SIGTERM)
                try: self.process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    os.killpg(self.process.pid,signal.SIGKILL); self.process.wait(timeout=2)
            return {'process_exited':self.process.poll() is not None,'exit_code':self.process.returncode}
        finally:
            self.wire.close(); self.stderr.close(); self.selector.close()


def snapshot_terminal(snapshot: dict, expected_model: str, expected_thinking: str) -> str | None:
    settings = snapshot.get('settings', {})
    selected = settings.get('model', {}).get('current', {})
    if selected.get('providerId', '')+'/'+selected.get('modelId', '') != expected_model:
        return 'route_changed'
    if settings.get('thoughtLevel', {}).get('current') != expected_thinking:
        return 'reasoning_changed'
    projection = snapshot.get('projection', {})
    runtime = snapshot.get('runtime', {})
    target = projection.get('target') or snapshot.get('session', {}).get('target') or {}
    busy = bool(runtime.get('activeTurnId') or projection.get('activeToolCalls') or projection.get('status') == 'running')
    if target.get('status') == 'complete' and not busy:
        return 'completed'
    if projection.get('status') == 'error' and not busy:
        return 'native_error'
    if target.get('status') in {'paused', 'budget_limited'} and not busy:
        return 'goal_'+target['status']
    return None


def capture_native_io(output: Path, native_dir: Path, session_id: str) -> dict:
    path = native_dir/('model-io-'+re.sub(r'[^a-zA-Z0-9_-]+','-',session_id).strip('-')[:80]+'.jsonl')
    if not path.is_file():
        return {'available': False, 'expected_path': str(path), 'actual_models': []}
    actual = set(); records = 0; digest = hashlib.sha256(); count_bytes = 0
    with path.open('rb') as source, (output/'model-io.redacted.jsonl').open('w') as target:
        for raw in source:
            digest.update(raw); count_bytes += len(raw)
            value = json.loads(raw)
            if value.get('sessionId') != session_id:
                raise ProtocolError('Native model IO file contains another session')
            records += 1
            model = value.get('model', {})
            if model.get('providerId') and model.get('modelId'):
                actual.add((model['providerId'], model['modelId'], model.get('variant')))
            target.write(json.dumps(sanitized(value),ensure_ascii=False)+'\n')
    return {'available': True, 'path': str(path), 'source_sha256': digest.hexdigest(), 'source_bytes': count_bytes,
            'record_count': records,
            'actual_models': [{'providerId': p, 'modelId': m, 'variant': v} for p,m,v in sorted(actual,key=str)]}


def capture_provider_usage(output: Path, database: Path, session_id: str) -> dict:
    """Read only this new session's request rows, avoiding UI input-baseline subtraction."""
    if not database.is_file(): return {'available': False, 'expected_path': str(database)}
    connection=sqlite3.connect(database.resolve().as_uri()+'?mode=ro',uri=True,timeout=5)
    connection.row_factory=sqlite3.Row
    columns=['id','logical_request_id','attempt_index','session_id','turn_id','query_source','provider_id','model_id','variant',
             'status','started_at','first_token_at','completed_at','duration_ms','finish_reason','tool_call_count',
             'input_tokens','output_tokens','reasoning_tokens','cache_creation_input_tokens','cache_read_input_tokens',
             'provider_total_tokens','computed_total_tokens','retry_count','error_type','error_code','error_message',
             'raw_usage_json','provider_metadata_json']
    try:
        rows=connection.execute('SELECT '+','.join(columns)+' FROM model_usage WHERE session_id = ? ORDER BY started_at,id',(session_id,)).fetchall()
    finally: connection.close()
    target=output/'provider-usage.redacted.jsonl'
    with target.open('w') as handle:
        for row in rows:
            record=dict(row)
            for key in ['raw_usage_json','provider_metadata_json']:
                if record[key]:
                    try: record[key.removesuffix('_json')]=json.loads(record[key])
                    except ValueError: record[key.removesuffix('_json')]=record[key]
                del record[key]
            handle.write(json.dumps(sanitized(record),ensure_ascii=False)+'\n')
    return {'available':True,'database':str(database),'session_id':session_id,'row_count':len(rows),
            'export_sha256':sha(target.read_bytes()),'query_scope':'exact session_id only; read-only SQLite connection',
            'semantics':'individual native request attempts, including Goal verification; no conversation UI input-baseline subtraction'}


def execute_goal(client: ZCodeProtocol, args: argparse.Namespace, output: Path,
                 metadata: dict, session_id: str, interrupted: list) -> None:
    objective = Path(args.objective_file).read_text()
    if not objective.strip(): raise ProtocolError('The native Goal objective is empty')
    metadata['objective_sha256'] = sha(objective.encode())
    client.request('session/subscribe', {'sessionId': session_id, 'deliveryKind': 'desktop-continuous', 'includeSnapshot': False})
    metadata['goal_submitted'] = True
    metadata['goal_activated'] = False
    metadata['model_calls_observed'] = None
    admission = client.request('session/goal', {'sessionId': session_id, 'action': 'set', 'objective': objective,
                                               'inputId': 'research-native-goal-'+session_id}, timeout=60)
    write_json(output/'goal-activation.redacted.json', admission)
    metadata['goal_activated'] = bool(admission.get('startedTurn'))
    if not metadata['goal_activated']: raise ProtocolError('Native Goal was stored without starting its execution loop')
    metadata['status'] = 'running'; write_json(output/'run.json', metadata)
    started = time.monotonic(); deadline = started + args.max_duration_seconds
    snapshot = admission['snapshot']; last_status = None
    while True:
        if interrupted:
            metadata['status'] = 'interrupted'; metadata['interrupt_signal'] = interrupted[0]; break
        if time.monotonic() >= deadline:
            metadata['status'] = 'timeout'; break
        snapshot = client.request('session/read', {'sessionId': session_id, 'messageLimit': 200}, timeout=min(30,max(1,deadline-time.monotonic())))
        terminal = snapshot_terminal(snapshot,args.model,args.thinking)
        if terminal:
            metadata['status'] = terminal; break
        projection=snapshot.get('projection', {}); runtime=snapshot.get('runtime', {})
        current = (projection.get('turnCount'), projection.get('totalTokenCount'), runtime.get('eventSeq'),
                   (projection.get('target') or {}).get('status'))
        if current != last_status:
            metadata['progress'] = {'at': utc(), 'turn_count': current[0], 'total_token_count': current[1],
                                    'event_seq': current[2], 'goal_status': current[3]}
            write_json(output/'run.json',metadata); last_status = current
        until=min(deadline,time.monotonic()+5)
        while time.monotonic()<until and not interrupted:
            client.poll(min(0.2,max(0,until-time.monotonic())))
            if client.process.poll() is not None: raise ProtocolError('Official ZCode child exited during the native Goal')
    if metadata['status'] != 'completed':
        client.request('session/stop', {'sessionId': session_id}, timeout=10)
        stop_deadline=time.monotonic()+10
        while time.monotonic()<stop_deadline:
            snapshot=client.request('session/read',{'sessionId':session_id,'messageLimit':200},timeout=10)
            if not snapshot.get('runtime',{}).get('activeTurnId') and not snapshot.get('projection',{}).get('activeToolCalls'): break
            client.poll(0.2)
    write_json(output/'final-session.redacted.json',snapshot)
    metadata['goal'] = snapshot.get('projection',{}).get('target') or snapshot.get('session',{}).get('target')
    metadata['goal_verifications'] = snapshot.get('runtime',{}).get('goalVerificationTimeline',[])
    usage = client.request('v4/conversation/usage',{'sessionId':session_id})
    write_json(output/'usage.json',usage); metadata['model_calls_observed']=usage['modelRequestCount']
    metadata['model_error_count']=usage['modelErrorCount']; metadata['goal_elapsed_seconds']=round(time.monotonic()-started,3)
    after=0
    with (output/'events.redacted.jsonl').open('w') as handle:
        while True:
            page=client.request('session/events',{'sessionId':session_id,'afterSeq':after,'limit':500})
            events=page.get('events',[])
            if not events: break
            for event in events: handle.write(json.dumps(sanitized(event),ensure_ascii=False)+'\n')
            latest=max(event.get('seq',0) for event in events)
            if latest<=after: raise ProtocolError('Native event pagination did not advance')
            after=latest
            if len(events)<500: break
    metadata['native_io'] = capture_native_io(output,Path(args.native_model_io_dir),session_id)
    metadata['provider_usage'] = capture_provider_usage(output,Path(args.native_database),session_id)
    metadata['actual_models'] = metadata['native_io']['actual_models']
    if any(item['providerId']+'/'+item['modelId']!=args.model or item.get('variant') not in {None,args.thinking} for item in metadata['actual_models']):
        metadata['status']='route_changed'


def run(args: argparse.Namespace) -> dict:
    cwd=Path(args.cwd).resolve(strict=True); output=Path(args.output_dir).resolve()
    output.mkdir(parents=True,exist_ok=True)
    if (output/'run.json').exists(): raise ValueError('Output belongs to an earlier attempt')
    node=Path(args.node).resolve(strict=True); cli=Path(args.cli).resolve(strict=True)
    version=subprocess.run([str(node),str(cli),'--version'],cwd=cwd,capture_output=True,text=True,timeout=30)
    metadata={'started_at':utc(),'status':'starting','cwd':str(cwd),'startup_only':args.startup_only,
              'runtime':{'node':str(node),'node_sha256':sha(node.read_bytes()),'cli':str(cli),
                         'cli_sha256':sha(cli.read_bytes()),'cli_version':version.stdout.strip()},
              'requested_model':args.model,'requested_thinking':args.thinking,'goal_submitted':False,
              'model_calls_observed':0,'max_duration_seconds':args.max_duration_seconds,
              'auth':'existing desktop Coding Plan credential projected in memory through the official native registry API; no credential file or global configuration mutation'}
    write_json(output/'run.json',metadata)
    client=ZCodeProtocol(node,cli,cwd,output); metadata['argv']=client.command
    session_id=None; start=time.monotonic(); interrupted=[]
    previous_handlers={sig: signal.signal(sig,lambda signum,frame: interrupted.append(signum)) for sig in [signal.SIGINT,signal.SIGTERM]} if threading.current_thread() is threading.main_thread() else {}
    workspace={'workspacePath':str(cwd),'workspaceKey':str(cwd)}
    try:
        registry=desktop_registry(Path(args.desktop_config),args.model)
        registry_result=client.request('workspace/updateProviderRegistry',{'workspace':workspace,'registry':registry,'includeWorkspaceState':False})
        metadata['provider_registry_result']=registry_result
        if registry_result.get('status') not in {'applied','unchanged'}:
            raise ProtocolError('Official desktop provider registry was not accepted')
        client.request('workspace/updateModelIoPreferences',{'workspace':workspace,'preferences':{'fullRetentionEnabled':True}})
        state=client.request('workspace/readState',{'workspace':workspace},timeout=args.startup_timeout_seconds)
        write_json(output/'workspace-state.redacted.json',state)
        available=state.get('settings',{}).get('model',{}).get('available',[])
        metadata['available_models']=[{key:item.get(key) for key in ['ref','label','providerLabel','contextWindow','maxOutputTokens','reasoning','disabledReason'] if key in item} for item in available]
        selected=next((item for item in available if item.get('ref',{}).get('providerId')+'/'+item.get('ref',{}).get('modelId')==args.model),None)
        if selected is None: raise ProtocolError('Requested exact provider/model is absent from the official runtime catalog')
        if selected.get('disabledReason'): raise ProtocolError('Requested model disabled: '+selected['disabledReason'])
        ref={k:selected['ref'][k] for k in ['providerId','modelId']}
        snapshot=client.request('session/create',{'workspace':workspace,'model':ref,'thoughtLevel':args.thinking,
              'mode':'yolo','persistence':'deferred' if args.startup_only else 'immediate','titleGenerationEnabled':False,
              'toolAllowlist':['Read','Bash','Write','Grep','Glob'],'mcpServers':[]},timeout=args.startup_timeout_seconds)
        write_json(output/'session-created.redacted.json',snapshot)
        session_id=snapshot['session']['sessionId']; metadata['native_session_id']=session_id
        settings=snapshot['settings']; metadata['selected_model']=settings['model']['current']; metadata['selected_thinking']=settings['thoughtLevel']
        if settings['model']['current']['providerId']+'/'+settings['model']['current']['modelId']!=args.model or settings['thoughtLevel'].get('current')!=args.thinking:
            raise ProtocolError('Native selection does not match requested exact route/effort')
        usage=client.request('v4/conversation/usage',{'sessionId':session_id})
        metadata['startup_usage']=usage; metadata['model_calls_observed']=usage['modelRequestCount']
        if usage['modelRequestCount']!=0: raise ProtocolError('Unexpected model calls during no-inference startup')
        if args.startup_only:
            metadata['status']='startup_ready'
        elif args.execute_goal:
            execute_goal(client,args,output,metadata,session_id,interrupted)
        else:
            raise ProtocolError('Semantic launch is not enabled until the adapter proposal has been reviewed')
    except (ProtocolError,ValueError,KeyError,TypeError,OSError) as exc:
        metadata['status']='execution_failed' if metadata.get('goal_submitted') else 'preflight_failed'; metadata['error']=str(exc)
    finally:
        evidence_errors=[]
        if session_id:
            if metadata.get('goal_submitted') and metadata['status'] != 'completed':
                try: client.request('session/stop',{'sessionId':session_id},timeout=10)
                except Exception as exc: evidence_errors.append({'step':'session/stop','error':str(exc)})
            if metadata.get('goal_submitted'):
                try:
                    final_snapshot=client.request('session/read',{'sessionId':session_id,'messageLimit':200},timeout=10)
                    write_json(output/'final-session.redacted.json',final_snapshot)
                    metadata['goal']=final_snapshot.get('projection',{}).get('target') or final_snapshot.get('session',{}).get('target')
                    metadata['goal_verifications']=final_snapshot.get('runtime',{}).get('goalVerificationTimeline',[])
                except Exception as exc: evidence_errors.append({'step':'session/read','error':str(exc)})
                try:
                    final_usage=client.request('v4/conversation/usage',{'sessionId':session_id},timeout=10)
                    write_json(output/'usage.json',final_usage)
                    metadata['model_calls_observed']=final_usage['modelRequestCount']
                except Exception as exc: evidence_errors.append({'step':'conversation/usage','error':str(exc)})
            try:
                close_args={'sessionId':session_id}
                if args.startup_only: close_args['expectedPersistence']='deferred'
                metadata['session_close']=client.request('session/close',close_args,timeout=10)
            except Exception as exc: metadata['session_close_error']=str(exc)
        try: metadata['cleanup']=client.close()
        except Exception as exc: metadata['cleanup']={'error':str(exc),'process_exited':client.process.poll() is not None}
        if session_id and metadata.get('goal_submitted'):
            try:
                metadata['native_io']=capture_native_io(output,Path(args.native_model_io_dir),session_id)
                metadata['actual_models']=metadata['native_io']['actual_models']
                models=metadata['actual_models']
                metadata['reasoning_verification']={'status':'verified' if models and all(item.get('variant')==args.thinking for item in models) else 'unknown',
                                                  'requested':args.thinking,'basis':'native request model.variant; omitted variant does not attest effort'}
                if any(item['providerId']+'/'+item['modelId']!=args.model or item.get('variant') not in {None,args.thinking} for item in models):
                    metadata['status']='route_changed'
                    metadata['reasoning_verification']['status']='mismatch'
            except Exception as exc: evidence_errors.append({'step':'native_model_io','error':str(exc)})
            try: metadata['provider_usage']=capture_provider_usage(output,Path(args.native_database),session_id)
            except Exception as exc: evidence_errors.append({'step':'native_provider_usage','error':str(exc)})
        if evidence_errors: metadata['evidence_capture_errors']=evidence_errors
        metadata['ended_at']=utc();metadata['elapsed_seconds']=round(time.monotonic()-start,3)
        try: write_json(output/'run.json',metadata)
        finally:
            for sig, handler in previous_handlers.items(): signal.signal(sig,handler)
    return metadata


def run_job(workspace: str | Path, output_dir: str | Path, assignment: str,
            model: str = 'builtin:zai-coding-plan/GLM-5.3', effort: str = 'max',
            timeout_seconds: float = 5400, cancel_event: threading.Event | None = None) -> dict:
    """Campaign entry point: one fresh official child/session and one native Goal."""
    workspace=Path(workspace).resolve(strict=True); output=Path(output_dir).resolve()
    if output == workspace or output.is_relative_to(workspace):
        raise ValueError('Raw ZCode evidence must be outside the subject workspace')
    if not assignment.strip(): raise ValueError('A nonempty assignment is required')
    output.mkdir(parents=True,exist_ok=False)
    objective=output/'goal-objective.md'; objective.write_text(assignment)
    command=[sys.executable,str(Path(__file__).resolve()),'--execute-goal','--cwd',str(workspace),
             '--output-dir',str(output),'--objective-file',str(objective),'--model',model,'--thinking',effort,
             '--max-duration-seconds',str(timeout_seconds)]
    started=time.monotonic(); wrapper_reason=None
    with (output/'adapter.stdout.log').open('w') as stdout, (output/'adapter.stderr.log').open('w') as stderr:
        process=subprocess.Popen(command,stdout=stdout,stderr=stderr,start_new_session=True)
        while process.poll() is None:
            if cancel_event is not None and cancel_event.is_set(): wrapper_reason='cancelled'
            if time.monotonic()-started > timeout_seconds+90: wrapper_reason='wrapper_timeout'
            if wrapper_reason:
                process.terminate()
                try: process.wait(timeout=25)
                except subprocess.TimeoutExpired: process.kill(); process.wait(timeout=5)
                break
            try: process.wait(timeout=0.5)
            except subprocess.TimeoutExpired: pass
    run_path=output/'run.json'
    result=json.loads(run_path.read_text()) if run_path.exists() else {'status':'error','error':'Adapter exited before its run receipt'}
    result['native_status']=result.get('status')
    result['status']='complete' if result.get('status')=='completed' else result.get('status','error')
    if wrapper_reason: result['status']=wrapper_reason
    result['elapsed_seconds']=round(time.monotonic()-started,3)
    result['adapter_exit_code']=process.returncode; result['raw_zcode_dir']=str(output)
    result['error']=result.get('error')
    write_json(output/'summary.json',result)
    return result


def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cwd',required=True);parser.add_argument('--output-dir',required=True)
    parser.add_argument('--node',default=DEFAULT_NODE);parser.add_argument('--cli',default=DEFAULT_CLI)
    parser.add_argument('--desktop-config',default=DEFAULT_DESKTOP_CONFIG)
    parser.add_argument('--model',default='builtin:zai-coding-plan/GLM-5.3')
    parser.add_argument('--thinking',default='max');parser.add_argument('--startup-only',action='store_true')
    parser.add_argument('--execute-goal',action='store_true',help='Explicit dispatcher admission after adapter readiness review')
    parser.add_argument('--objective-file');parser.add_argument('--max-duration-seconds',type=float,default=5400)
    parser.add_argument('--native-model-io-dir',default='/home/sittingmongoose/.zcode/cli/rollout')
    parser.add_argument('--native-database',default='/home/sittingmongoose/.zcode/cli/db/db.sqlite')
    parser.add_argument('--startup-timeout-seconds',type=float,default=60)
    args=parser.parse_args()
    if args.execute_goal and (args.startup_only or not args.objective_file): parser.error('--execute-goal requires --objective-file and excludes --startup-only')
    result=run(args)
    print(json.dumps({'status':result['status'],'error':result.get('error'),'run_file':str(Path(args.output_dir).resolve()/'run.json')}))
    return 0 if result['status'] in {'startup_ready','completed'} else 1


if __name__=='__main__': raise SystemExit(main())
