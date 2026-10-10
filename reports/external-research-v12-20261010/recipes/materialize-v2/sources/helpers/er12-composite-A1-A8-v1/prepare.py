#!/usr/bin/env python3
"""Pinned, single-recipe A1 + verbatim A8 hook overlay. Root owns dispatch."""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
BASE = HERE.parent / 'er12-screen-v1'
METHOD = HERE.parent.parent / 'methods' / 'A8'
RECIPE = 'er12-composite-A1-A8-v1'
# Fixed in this helper before importing any baseline code.
PINS = {
    'base_prepare': (BASE / 'prepare.py', '3af25138aa7fc20123c238e8485df3210d9a4f3f2bf6419a256d73a1c4176fdc'),
    'base_reveal': (BASE / 'reveal.py', 'ec9579204af96aa6a45caba1eef94c6ca1a799c296a2363b179af359bd908abe'),
    'base_bootstrap': (BASE / 'bootstrap.js', '67b8667f5f7d09b854541f95c8453b977f3514a4243d679fdb24a26335fa4c56'),
    'critic_delta': (METHOD / 'critic_prompt_delta.txt', '6ca210592ebaffd1228f390855af2dcbb7b338dcbb3e00c9fb57f0bdc8672c0d'),
    'reviser_delta': (METHOD / 'reviser_prompt_delta.txt', '31b0b79da9d1a99d81103a485448bbd2d518e5c48cd56b15a1a1a9cb9d11e087'),
}

def components():
    out = {}
    for name, (path, expected) in PINS.items():
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != expected:
            raise SystemExit(f'pinned component changed: {name}')
        out[name] = {'path': str(path), 'sha256': expected, 'bytes': len(raw)}
    return out

COMPONENTS = components()  # Verify all actual inputs BEFORE baseline import.
GUARD = {'recipe_id': RECIPE, 'components': COMPONENTS}
spec = importlib.util.spec_from_file_location('er12_composite_pinned_base', BASE / 'prepare.py')
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
original_prompt, original_prepare, original_config = b.make_prompt, b.prepare, b.load_config
# REPO remains the original baseline directory: exact original reveal command.

def load_config(path):
    components()
    raw = b.read_json(Path(path).expanduser().resolve())
    if raw.get('method_id') != 'A1' or raw.get('stage_prompt_deltas') != {}:
        b.fail('require literal method_id=A1 and stage_prompt_deltas={}')
    if raw.get('dispatch_owner') != 'root' or raw.get('composite_guard') != GUARD:
        b.fail('require root sole dispatch and exact pinned composite_guard')
    return original_config(path)

def make_prompt(c, stage, inputs, deadline, whole):
    components()
    full = original_prompt(c, stage, inputs, deadline, whole)
    if stage == 'investigator':
        return full
    return full + '\n' + PINS[stage + '_delta'][0].read_bytes().decode('utf-8')

def prepare(c, stage):
    components()  # Also guard long-lived imported use before each preparation.
    if c.get('composite_guard') != GUARD or c.get('dispatch_owner') != 'root' or c.get('_method') != 'A1' or c.get('_deltas') != {}:
        b.fail('configuration does not match the sole pinned composite recipe')
    p = c['_root'] / 'stages' / stage
    key = f"er12-composite-{c['run_id']}-{stage}-A1-A8-v1"
    # Never adopt any used baseline/other recipe stage, including predecessors.
    # Original retry guard remains authoritative for expiry, frozen bytes and
    # dispatch receipts; no request/deadline is recreated on a retry.
    for name, saved in b.stage_paths(c['_root']).items():
        if not (saved / 'request.json').exists():
            continue
        freeze = b.read_json(saved / 'freeze.json') if (saved / 'freeze.json').exists() else {}
        req = b.read_json(saved / 'request.json')
        saved_key = f"er12-composite-{c['run_id']}-{name}-A1-A8-v1"
        if (freeze.get('composite_guard') != GUARD or req.get('clientRequestId') != saved_key
                or req.get('args', {}).get('clientRequestId') != saved_key
                or any(item not in freeze.get('frozen_inputs', []) for item in COMPONENTS.values())):
            b.fail('duplicate used runtime belongs to another recipe; preserve it and stop')
    result = original_prepare(c, stage)  # exactly one baseline prepare call
    if not result.get('retry') and not result.get('alreadyDispatched'):
        freeze = b.read_json(p / 'freeze.json')
        freeze['composite_guard'] = GUARD
        freeze['composite_stage_delta'] = COMPONENTS.get(stage + '_delta')
        freeze['frozen_inputs'].extend(COMPONENTS.values())
        b.put_json(p / 'freeze.json', freeze)
        req = b.read_json(p / 'request.json')
        req['clientRequestId'] = req['args']['clientRequestId'] = key
        b.put_json(p / 'request.json', req)
        result['args'] = req['args']
    return result

b.load_config, b.make_prompt, b.prepare = load_config, make_prompt, prepare
if __name__ == '__main__':
    b.main()
