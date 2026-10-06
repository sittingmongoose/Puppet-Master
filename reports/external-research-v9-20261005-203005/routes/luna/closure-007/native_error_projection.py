"""Read-only additive native terminal-error classifier; no candidate body export.

Input is one trusted native run directory. Only matching session_meta identity
and event_msg/task_complete.error are considered. Unknown messages/codes are
hashed; credentials, response items and agent messages are never returned.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re

UUID=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
CLASSES={'server_overloaded':'service_capacity','usage_limit_reached':'account_quota',
    'rate_limit_exceeded':'rate_limit','rate_limit_reached':'rate_limit',
    'too_many_requests':'rate_limit','unauthorized':'authentication',
    'authentication_failed':'authentication','not_authenticated':'authentication',
    'auth_error':'authentication','permission_denied':'permission',
    'approval_denied':'permission','policy_denied':'permission'}
CAPACITY_MESSAGE='Selected model is at capacity. Please try a different model.'


def encoded(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def sha(value):return hashlib.sha256(encoded(value)).hexdigest()


def regular(path):
    path=Path(path).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)) or not path.is_file() or path.stat().st_uid!=os.getuid():
        raise ValueError('trusted owned regular metadata required')
    return path


def normalized(value):
    if not isinstance(value,str):return None
    return re.sub(r'(?<!^)(?=[A-Z])','_',value).lower()


def classify(error):
    if not isinstance(error,dict):
        return {'cause_class':'UNKNOWN','native_codex_error_info':'UNKNOWN','error_fields_sha256':sha(error)}
    code=error.get('codex_error_info',error.get('codexErrorInfo'))
    tag=next(iter(code)) if isinstance(code,dict) and len(code)==1 else code
    norm=normalized(tag);message=error.get('message');status=None
    for value in (error.get('http_status_code'),error.get('httpStatusCode'),error.get('status')):
        if type(value) is int and 100<=value<=599:status=value
    cause=CLASSES.get(norm,'UNKNOWN')
    if cause=='UNKNOWN' and message==CAPACITY_MESSAGE:cause='service_capacity'
    if cause=='UNKNOWN' and status in (401,403,429):cause={401:'authentication',403:'permission',429:'rate_limit'}[status]
    receipt={'cause_class':cause,'native_codex_error_info':norm if norm in CLASSES else 'UNKNOWN',
        'native_error_code_sha256':sha(code),'http_status':status,
        'message_sha256':sha(message),'error_fields_sha256':sha(error),
        'known_canonical_message':CAPACITY_MESSAGE if message==CAPACITY_MESSAGE else None,
        'unknown_message_contents_exported':False}
    return receipt


def extract(native_out,expected_thread_id=None):
    native_out=Path(native_out).absolute()
    result_path=regular(native_out/'result.json');result=json.loads(result_path.read_text())
    thread=expected_thread_id or result.get('thread_id')
    if not isinstance(thread,str) or not UUID.fullmatch(thread) or thread!=result.get('thread_id'):
        raise ValueError('exact owned native thread identity required')
    directory=native_out/'host-private/codex-home/sessions';events=[];matched=0;parse_failures=0
    if any(p.is_symlink() for p in (directory,*directory.parents)):
        raise ValueError('session metadata alias denied')
    for path in sorted(directory.rglob('*.jsonl')):
        path=regular(path);matching=False
        with path.open() as file:
            for number,line in enumerate(file,1):
                if len(line)>16*1024*1024:raise ValueError('native metadata frame cap')
                try:obj=json.loads(line)
                except ValueError:parse_failures+=1;continue
                if not isinstance(obj,dict):parse_failures+=1;continue
                value=obj.get('payload') or {}
                if not isinstance(value,dict):parse_failures+=1;continue
                if obj.get('type')=='session_meta':
                    matching=value.get('id')==thread
                    if matching:matched+=1
                    continue
                if not matching or obj.get('type')!='event_msg' or value.get('type')!='task_complete':continue
                error=value.get('error')
                if error is None:continue
                projected=classify(error)
                projected.update(event_timestamp=obj.get('timestamp'),event_type='task_complete.error',
                    event_locator={'journal_basename':path.name,'line_number':number},
                    duration_ms=value.get('duration_ms') if type(value.get('duration_ms')) is int else None)
                projected['receipt_sha256']=sha({'thread_id':thread,'timestamp':obj.get('timestamp'),
                    'event':'task_complete.error','error':error})
                events.append(projected)
    receipt={'schema':'er9.luna.native-error-projection.v1','thread_id':thread,
        'reader_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'native_result_sha256':hashlib.sha256(result_path.read_bytes()).hexdigest(),
        'matching_session_metadata_records':matched,'unparsed_lines':parse_failures,
        'metadata_status':'ERROR_RECEIPT_PRESENT' if events else 'NO_TERMINAL_ERROR_RECEIPT',
        'errors':events,'service_capacity_error_observed':any(v['cause_class']=='service_capacity' for v in events),
        'admission_policy':'owned by sole ops; no automatic model substitution or approval bypass',
        'candidate_bodies_credentials_and_account_credits_exported':False,'mutations_performed':False}
    receipt['projection_sha256']=sha(receipt)
    return receipt


def main():
    p=argparse.ArgumentParser();p.add_argument('--native-out',type=Path,required=True)
    p.add_argument('--expected-thread-id');p.add_argument('--out',type=Path,required=True);args=p.parse_args()
    try:receipt=extract(args.native_out,args.expected_thread_id)
    except (ValueError,OSError) as error:
        receipt={'schema':'er9.luna.native-error-projection.v1','metadata_status':'UNAVAILABLE',
                 'error_class':type(error).__name__,'candidate_bodies_exported':False}
    with args.out.open('x') as file:file.write(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({k:receipt.get(k) for k in ('metadata_status','service_capacity_error_observed','projection_sha256')}))
    return 0 if receipt['metadata_status']!='UNAVAILABLE' else 1


if __name__=='__main__':raise SystemExit(main())
