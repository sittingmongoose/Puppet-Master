#!/usr/bin/env python3
"""Root-only unstarted-stage additive terminal loader; no native or dispatch calls."""
import argparse
import hashlib
import importlib.util
import json
import uuid
from pathlib import Path

HERE = Path(__file__).absolute().parent
MARKER = 'prospective-terminal-capture-v1.json'
PROGRAM = 'native-terminal-capture.js'
CHECKER = 'native-terminal-check.py'
NAMES = ('request.json','freeze.json','input-map.json','assignment.md')
CAPTURE_SHA = '24ff3ed714c7108a49a2614d0afbda003fdac0bed50044a9952c3f77860d29ba'


def sha(b):
    return hashlib.sha256(b).hexdigest()


def encode(obj):
    return (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()


def load(p):
    spec = importlib.util.spec_from_file_location('existing_activation_capture', p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def transform(stage):
    stage = Path(stage).absolute()
    caproot = HERE.parent / 'prospective-capture-v1'
    if any(p.is_symlink() for p in (caproot, *caproot.parents)) or sha((caproot/'MANIFEST.json').read_bytes()) != CAPTURE_SHA:
        raise ValueError('accepted activation capture manifest pin required')
    cm = json.loads((caproot/'MANIFEST.json').read_bytes())
    for row in cm['files']:
        p = caproot/row['relative_path']
        if p.is_symlink() or sha(p.read_bytes()) != row['sha256']:
            raise ValueError('accepted activation helper bytes changed')
    capture = load(caproot/'install.py')
    root = stage.parents[3]
    owner = json.loads((root/'mechanics/exact-activation-capture-v2-1/capture-owner.json').read_bytes())
    config = Path(owner['config_path'])
    if any(p.is_symlink() for p in (config,*config.parents)) or sha(config.read_bytes()) != owner['config_sha256']:
        raise ValueError('original materialized config changed')
    cfg = json.loads(config.read_bytes())
    profiles = {'R0':{'investigator':1800,'critic':720,'reviser':1080},'B02':{'investigator':1800,'critic':1800},'B06':{'investigator':1800,'critic-breadth':360,'critic-truth':360,'reviser':1080}}
    if (cfg.get('public_recipe_choice') not in profiles or cfg['stage_budgets_s'] != profiles[cfg['public_recipe_choice']]
            or stage.parent != Path(owner['runtime_root'])/'stages' or stage.name not in cfg['stage_budgets_s']):
        raise ValueError('supported original R0/B02/B06 role shape required')
    checker = (HERE/'runtime-check.py').read_bytes(); template = (HERE/'terminal-template.js').read_bytes()
    allowed = set(NAMES) | {'sources','invocation-clarification.json','exact-goal-binding-guard.json','exact-activation-capture-v2-1.json','service-tier-change.json','prospective-capture-v1.json','native-capture.js',MARKER,PROGRAM,CHECKER}
    for p in (stage,*stage.parents):
        if p.is_symlink(): raise ValueError('symlink stage ancestry')
    for p in stage.rglob('*'):
        if p.is_symlink(): raise ValueError('symlink stage member')
    for p in stage.iterdir():
        if p.is_dir() and p.name.startswith(('.invocation-backup-','.goal-guard-backup-','.activation-backup-','.prospective-backup-','.terminal-backup-')): continue
        if p.name not in allowed or (p.name=='sources' and any(p.iterdir())):
            raise ValueError('used/dispatched/started/partial stage refused: '+p.name)
    if (stage/MARKER).exists():
        out=json.loads((stage/MARKER).read_bytes())
        if (out['template_sha256']!=sha(template) or out['checker_sha256']!=sha(checker)
                or out['config_sha256']!=owner['config_sha256'] or any(sha((stage/n).read_bytes())!=v for n,v in out['runtime_pins'].items())):
            raise ValueError('changed terminal prepared bytes; no repair')
        # Original clock expiry check, using the same selected identity fields.
        import datetime as dt
        f=json.loads((stage/'freeze.json').read_bytes())
        if any(dt.datetime.fromisoformat(f[k].replace('Z','+00:00'))<=dt.datetime.now(dt.timezone.utc) for k in ('stage_deadline_utc','whole_deadline_utc')):
            raise ValueError('original deadline expired; no clock reset')
        return dict(out,idempotent=True)
    if (stage/PROGRAM).exists() or (stage/CHECKER).exists():
        raise ValueError('partial terminal installation; no repair')
    # First preparation uses the unchanged accepted activation installer/API.
    capture.transform(stage)
    original={n:(stage/n).read_bytes() for n in NAMES}
    req,freeze,im=(json.loads(original[n]) for n in NAMES[:3])
    old=capture.load(root/'mechanics/exact-activation-capture-v2-1/overlay.py')
    old.ALLOWED_RECORD_PATHS={str(stage/n) for n in NAMES}
    binding={'stageDir':str(stage),'config_path':str(config),'config_sha256':owner['config_sha256'],
             'frozen_identity':{k:freeze[k] for k in ('native_goal_objective','stage_deadline_utc','whole_deadline_utc','stage_budget_s')},
             'required_outputs':cfg['output_selection'][stage.name]}
    binding_sha=sha(json.dumps(binding,ensure_ascii=False,sort_keys=True).encode())
    program=template.decode().replace('__STAGE_DIR_JSON__',json.dumps(str(stage))).replace('__CHECKER_SHA_JSON__',json.dumps(sha(checker))).replace('__BINDING_SHA_JSON__',json.dumps(binding_sha)).encode()
    addition=('\nPROSPECTIVE TERMINAL CAPTURE v1 — AFTER REQUIRED OUTPUTS\n'
              'After saving all required outputs, execute this exact SHA-bound loader ONCE in this same native Goal context. It is the sole completion+save step and replaces ad-hoc completion/save commands. Do not call update_goal separately first; never retype a receipt, substitute get_goal, retry completion after failed/unknown capture, or create another Goal. Getter is identity/status preflight only. Original birth/objective/T0/deadlines/caps/duties and cards stay binding. Failure/unknown is a failed capture, never waived.\n'
              '```javascript\n'+capture.loader(stage/PROGRAM,sha(program))+'\n```\n'
              'Require terminal_capture_checked=true for captured completion. The output snapshot is pre-completion mechanics only; dispatcher still requires original T3 terminal/zero-pending-child observation and immutable handoff.\n')
    changed={str(stage/'assignment.md'):original['assignment.md']+addition.encode()}
    req['args']['task']+=addition
    pending={'request.json':req,'freeze.json':freeze,'input-map.json':im};paths={str(stage/n) for n in NAMES}
    while pending:
        ready=[n for n,obj in pending.items() if (old.dependencies(obj)&paths|({str(stage/'assignment.md'),str(stage/'request.json')} if n=='freeze.json' else set()))<=changed.keys()]
        if not ready:raise ValueError('unsupported cyclic prepared hashes')
        for n in ready:
            obj=pending.pop(n);old.records(obj,changed)
            if n=='freeze.json':
                obj['request_sha256']=sha(changed[str(stage/'request.json')])
                if 'assignment_sha256' in obj:obj['assignment_sha256']=sha(changed[str(stage/'assignment.md')])
            changed[str(stage/n)]=encode(obj) if obj!=json.loads(original[n]) else original[n]
    backup=stage/('.terminal-backup-'+uuid.uuid4().hex);backup.mkdir()
    for n,b in original.items():(backup/n).write_bytes(b);(backup/n).chmod(0o444)
    out={'version':'prospective-terminal-capture-v1','stageDir':str(stage),'backupDir':str(backup),'args':req['args'],'dispatch_performed':False,'root_only_integration':True,'idempotent':False,
         'template_sha256':sha(template),'checker_sha256':sha(checker),'program_sha256':sha(program),'config_sha256':owner['config_sha256'],
         'binding':binding,'binding_sha256':binding_sha,'preparer_sha256':sha((root/'helpers/er12-screen-v1/prepare.py').read_bytes()),'original_sha256':{n:sha(b) for n,b in original.items()},
         'runtime_pins':{**{n:sha(changed[str(stage/n)]) for n in NAMES},PROGRAM:sha(program),CHECKER:sha(checker)}}
    if any((stage/n).read_bytes()!=original[n] for n in NAMES):raise ValueError('prepared bytes changed concurrently')
    for n,b in ((PROGRAM,program),(CHECKER,checker)):
        with (stage/n).open('xb') as p:p.write(b)
        (stage/n).chmod(0o444)
    for n in NAMES:(stage/n).write_bytes(changed[str(stage/n)])
    with (stage/MARKER).open('xb') as p:p.write(encode(out))
    return out


def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--stage-dir',required=True,type=Path);a=ap.parse_args()
    try:print(json.dumps(transform(a.stage_dir),ensure_ascii=False))
    except (ValueError,OSError,KeyError,TypeError) as e:ap.exit(2,str(e)+'\n')


if __name__=='__main__':main()
