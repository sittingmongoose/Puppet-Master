#!/usr/bin/env python3
"""Positive owned-path selector. Candidate/source/native/evaluator bodies excluded."""
import json
import argparse
from pathlib import Path
import prepare_successors as p

ROOT=Path(__file__).resolve().parent
NEUTRAL_INPUT_NAMES={'brief.md','output_contract.md','diagnostic_task.md',
                     'arm_instruction.md','delivery_objective.md','source_access.json','source_separation.md'}
HOST_NAMES={'card.json','RESOURCE_VERSION.json','PAIR_RESOURCE_FREEZE.json',
            'OPAQUE_COPY_RECEIPT.json','registration.json','prepared-stage.json',
            'COMMON_RESOURCE_BINDING.json','OUTBOX.json','TRANSPORT_ADDENDUM.json',
            'TRANSPORT_PRESERVATION.json','DEFERRED_BINDING_CONTRACT.json',
            'PIPELINE_CLOSURE.json','ROLE_LINKING_RULES.json','PRESERVATION.json',
            'role-bound-registration.json','role-bound-stage.json'}


def files(immutable_only=False):
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file() or path.is_symlink():continue
        relative=path.relative_to(ROOT)
        if '__pycache__' in relative.parts or path.name.startswith('PUBLICATION_SELECTION'):continue
        if len(relative.parts)==1:
            if path.suffix in ({'.json'} if immutable_only else {'.py','.md','.json'}):yield path
        elif path.name in HOST_NAMES and 'workspace' not in relative.parts:
            yield path
        elif path.name=='TASK.md' and path.parent.name=='workspace':
            yield path
        elif path.name in NEUTRAL_INPUT_NAMES and path.parent.name=='inputs':
            yield path


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',default='PUBLICATION_SELECTION.json')
    parser.add_argument('--immutable-only',action='store_true')
    args=parser.parse_args()
    if Path(args.output).name!=args.output:raise ValueError('Owned top-level selector name required')
    rows=[{'path':str(path),'sha256':p.sha(path)} for path in files(args.immutable_only)]
    for row in rows:
        path=Path(row['path'])
        if {'native','out','prior','seed','source_context','evaluation'}.intersection(path.parts):
            raise ValueError('Positive selector attempted body disclosure')
        if path.suffix=='.body':raise ValueError('Captured source body disclosure')
    p.put(ROOT/args.output,{'schema':'er9.positive-publication-selection.v1',
          'scope_root':str(ROOT),'files':rows,
          'candidate_role_or_captured_source_bodies_selected':False,
          'native_raw_output_auth_private_evaluator_selected':False,
          'released_confirmation_TASKs_only_after_unchanged_recipe_lock':True,
          'publisher_only_adds_listed_exact_sha_files':True,
          'native_starts':0,'quality_or_pipeline_completion_claimed':False})
    print(json.dumps({'files':len(rows),'selector_sha256':p.sha(ROOT/args.output)}))


if __name__=='__main__':main()
