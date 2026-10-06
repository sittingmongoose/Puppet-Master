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
        self.wire.write(json.dumps({'at':utc(),'direction':'out','message':sanitized(message)},ensure_ascii=False)+'\n')
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
                    self.wire.write(json.dumps({'at':utc(),'direction':'in','parse_error':True,'text':sanitized(line.decode(errors='replace'))})+'\n'); self.wire.flush()
                    continue
                self.wire.write(json.dumps({'at':utc(),'direction':'in','message':sanitized(message)},ensure_ascii=False)+'\n'); self.wire.flush()
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
    actual = set(); records = 0; count_bytes = 0
    with path.open('rb') as source, (output/'model-io.redacted.jsonl').open('w') as target:
        for raw in source:
            count_bytes += len(raw)
            value = json.loads(raw)
            if value.get('sessionId') != session_id:
                raise ProtocolError('Native model IO file contains another session')
            records += 1
            model = value.get('model', {})
            if model.get('providerId') and model.get('modelId'):
                actual.add((model['providerId'], model['modelId'], model.get('variant')))
            target.write(json.dumps(sanitized(value),ensure_ascii=False)+'\n')
    return {'available': True, 'path': str(path), 'redacted_export_sha256':sha((output/'model-io.redacted.jsonl').read_bytes()), 'source_bytes': count_bytes,
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
