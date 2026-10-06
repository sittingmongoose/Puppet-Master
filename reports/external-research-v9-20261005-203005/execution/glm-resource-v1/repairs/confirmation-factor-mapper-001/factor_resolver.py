"""Closed confirmation recipe labels -> existing literal factor DTO codes."""
import hashlib
import json
from pathlib import Path
import re

HERE=Path(__file__).resolve().parent
LAB=HERE.parents[4]
LOCK_PATH=LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'
LOCK_SHA='2e6a79f793474aa238c5d8e896fbb08e19f4e31a6277aa81095a5338671957db'

def declared_method_factors(card):
    method=card.get('method_id')
    if isinstance(method,str) and re.fullmatch(r'V(?:0[1-9]|1[0-6])',method):
        # Preserve existing literal declarations. The unchanged carrier still
        # rejects actual V06, so this mapping cannot relax that boundary.
        return [method]
    if method not in {'CONFIRM-A','CONFIRM-B'}:
        raise ValueError('Explicit literal factor or closed confirmation recipe required')
    reference=card.get('selection_lock_ref')
    if not isinstance(reference,dict) or reference.get('path')!=str(LOCK_PATH) or reference.get('sha256')!=LOCK_SHA:
        raise ValueError('Exact original closed confirmation recipe pin required')
    if any(path.is_symlink() for path in (LOCK_PATH,*LOCK_PATH.parents)):
        raise ValueError('Recipe lock aliases denied')
    raw=LOCK_PATH.read_bytes()
    if hashlib.sha256(raw).hexdigest()!=LOCK_SHA:raise ValueError('Original confirmation recipe source drift')
    lock=json.loads(raw);bundle=lock['common_treatment_bundle']
    if card.get('exact_locked_bundle')!=bundle:
        raise ValueError('Compound card bundle differs from exact frozen recipe')
    recipe=method.removeprefix('CONFIRM-')
    if card.get('recipe')!=recipe:raise ValueError('Compound method/recipe identity conflict')
    expected=['research','critique','revision'] if recipe=='A' else ['research','critic_final']
    stages=card.get('treatment_stages')
    if not isinstance(stages,list) or [s.get('stage') for s in stages]!=expected or [s.get('max_native_seconds') for s in stages]!=lock[recipe]['seconds']:
        raise ValueError('Original closed compound topology/allocation required')
    factors=[]
    for declaration in bundle:
        match=re.match(r'^(V(?:0[1-9]|1[0-6]))\s',declaration)
        if match:factors.append(match.group(1))
    if factors!=['V14','V10','V16']:
        raise ValueError('Closed confirmation factor declaration is incomplete or conflicts')
    return factors
