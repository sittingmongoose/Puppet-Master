"""Predeclared clock delivery from actual original controller variables only.

This constructor never computes action from cleanup, reads a scientific Task,
creates a Goal, writes final artifacts or supplies a new relative timer.
"""
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
_release_spec=importlib.util.spec_from_file_location('_er9_luna_v15_clock_release',Path(__file__).with_name('resource_tool_release.py'))
_release=importlib.util.module_from_spec(_release_spec);_release_spec.loader.exec_module(_release)
load_tools,TOOLS=_release.load_tools,_release.TOOLS

_decl_spec=importlib.util.spec_from_file_location('_er9_luna_v15_clock_decl',Path(__file__).with_name('clock_declaration.py'))
_decl=importlib.util.module_from_spec(_decl_spec);_decl_spec.loader.exec_module(_decl)
VISIBLE_CLOCK,INITIAL_POLICY,declaration=_decl.VISIBLE_CLOCK,_decl.INITIAL_POLICY,_decl.declaration


def encoded(value):return json.dumps(value,ensure_ascii=False,allow_nan=False,separators=(',',':')).encode()
def sha(raw):return hashlib.sha256(raw).hexdigest()


def regular(path):
    path=Path(path).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)) or not path.is_file() or path.stat().st_uid!=os.getuid():raise ValueError('trusted clock declaration required')
    return path


def validate_declaration(path,digest,stage_id):
    path=regular(path);raw=path.read_bytes()
    if len(raw)>16384 or sha(raw)!=digest or json.loads(raw)!=declaration(stage_id):raise ValueError('predeclared stage clock delivery mismatch')
    return {'path':str(path),'sha256':digest,'policy':INITIAL_POLICY,'stage_id':stage_id}


def exclusive(path,raw):
    path=Path(path).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)):raise ValueError('clock metadata alias denied')
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,'wb') as file:file.write(raw)


def prepare_original_clock(private,stage_id,birth_ns,max_seconds,native_stop,total_stop,controller_path):
    load_tools()
    spec=importlib.util.spec_from_file_location('_er9_luna_original_clock_constructor',TOOLS/'clock_binding.py')
    binding=importlib.util.module_from_spec(spec);spec.loader.exec_module(binding)
    private=Path(private);receipt=private/'STAGE_CLOCK_RECEIPT.json';profile=private/'clock_profile.json'
    allocation=int(max_seconds) if math.isfinite(max_seconds) and max_seconds==int(max_seconds) and 1<=max_seconds<=43200 else None
    controller=regular(controller_path)
    built=binding.binding(stage_id=stage_id,original_birth_monotonic_ns=birth_ns,
        original_stage_allocation_seconds=allocation,original_candidate_action_deadline_monotonic_ns=native_stop,
        original_total_cleanup_stop_monotonic_ns=total_stop,receipt_path=receipt,
        controller_path=controller,controller_sha256=sha(controller.read_bytes()),action_field='native_stop_monotonic_ns')
    exclusive(receipt,built['receipt_bytes']);exclusive(profile,built['profile_bytes'])
    return profile,{'clock_profile_sha256':sha(built['profile_bytes']),'original_controller_receipt_sha256':sha(built['receipt_bytes']),
        'controller_source_sha256':sha(controller.read_bytes()),'action_field':'native_stop_monotonic_ns',
        'stage_id':stage_id,'original_birth_monotonic_ns':birth_ns,'original_stage_allocation_seconds':allocation,
        'original_candidate_action_deadline_monotonic_ns':native_stop,'original_total_cleanup_stop_monotonic_ns':total_stop,
        'phase':'saved original controller scalars before Goal or turn; not native activation proof'}


def materialize_clock_input(config,workspace,stage_id,scientific_body,goal_objective):
    text=config['initial_clock_metadata_utf8'];metadata=config['initial_clock_metadata']
    if json.loads(text)!=metadata or metadata['stage_clock']['stage_id']!=stage_id:raise ValueError('initial clock object/string/stage drift')
    raw=text.encode('utf-8');visible=Path(workspace)/VISIBLE_CLOCK
    exclusive(visible,raw)
    native_input=[{'type':'text','text':scientific_body,'text_elements':[]},
                  {'type':'text','text':text,'text_elements':[]}]
    proof={'schema':'er9.luna.pre-goal-initial-clock-input-binding.v1','stage_id':stage_id,
        'policy':INITIAL_POLICY,'visible_clock_path':VISIBLE_CLOCK,'visible_clock_file_sha256':sha(raw),
        'neutral_second_native_text_sha256':sha(raw),'scientific_first_native_text_sha256':sha(scientific_body.encode()),
        'goal_objective_sha256':sha(goal_objective.encode()),'actual_initial_input_array_sha256':sha(encoded(native_input)),
        'clock_profile_sha256':config['clock_profile_sha256'],'initial_clock_metadata':metadata,
        'scientific_text_or_goal_objective_appended':False,'actual_initial_text_count':2,
        'phase':'prepared before native Goal/turn','model_consumption':'UNESTABLISHED; delivery must be confirmed by actual initial turn acknowledgement'}
    return native_input,proof
