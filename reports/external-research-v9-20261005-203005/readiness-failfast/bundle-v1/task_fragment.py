"""Declared prospective Task suffix; no Task mutation in the live worker."""
import argparse
import hashlib
import json
from pathlib import Path

INPUT_RELATIVE_PATH = 'inputs/STAGE_CLOCK.json'
BEHAVIORAL_VERSION = 'er9.common-original-action-clock-awareness.v1'

def render(original_allocation_seconds):
    if type(original_allocation_seconds) is not int or not 36 <= original_allocation_seconds <= 43200:
        raise ValueError('Exact original integer stage allocation required')
    return (f'\n\n## Original stage clock — common prospective overlay\n'
        f'The original stage allocation is {original_allocation_seconds} seconds, including the existing cleanup reserve. '
        f'Read {INPUT_RELATIVE_PATH} at the start of this stage for the initial clock snapshot. '
        'The original candidate action deadline and remaining candidate action time are separate from the total cleanup stop. '
        'Every tool call also returns a separate clock telemetry text block, including errors. '
        'Use a current telemetry snapshot when checking remaining action time; the initial file is a birth-time snapshot. '
        'UNKNOWN means that the action deadline has no exposed source proof. '
        'A zero or expired remaining-action value grants no additional action time. '
        'Clock telemetry neither resets the original clock nor changes permissions, native Goal status, stage duties or output requirements.\n').encode('utf-8')

def validate_packet(spec):
    selected=spec['glm_resource'].get('clock_fragment')
    if not isinstance(selected,dict) or set(selected)!={'path','sha256'}:
        raise ValueError('Declared prospective clock fragment path and SHA required')
    path=Path(selected['path']).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)) or not path.is_file():
        raise ValueError('Pinned regular clock fragment required')
    raw=path.read_bytes()
    if hashlib.sha256(raw).hexdigest()!=selected['sha256'] or raw!=render(spec['max_seconds']):
        raise ValueError('Declared clock fragment source/allocation drift')
    # Read only the neutral suffix. Scientific Task prefix bytes are never
    # parsed or rewritten here; the worker separately verifies its whole hash.
    task=Path(spec['prompt_file'])
    with task.open('rb') as handle:
        handle.seek(0,2)
        if handle.tell()<len(raw):raise ValueError('Declared clock fragment absent from prepared Task')
        handle.seek(-len(raw),2)
        if handle.read()!=raw:raise ValueError('Prepared Task must end with its declared clock fragment')
    expected=Path(spec['workspace']).absolute()/'TASK.md'
    if task.absolute()!=expected:raise ValueError('Native objective and boundary Task must be the same frozen file')
    return {'path':str(path),'sha256':selected['sha256'],
            'constructor_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'behavioral_version':BEHAVIORAL_VERSION,'input_relative_path':INPUT_RELATIVE_PATH}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--original-allocation-seconds',type=int,required=True)
    parser.add_argument('--out',required=True)
    args=parser.parse_args();raw=render(args.original_allocation_seconds)
    path=Path(args.out)
    with path.open('xb') as output:output.write(raw)
    print(json.dumps({'fragment_path':str(path.absolute()),'sha256':hashlib.sha256(raw).hexdigest(),
        'input_relative_path':INPUT_RELATIVE_PATH,'behavioral_version':BEHAVIORAL_VERSION}))

if __name__=='__main__':main()
