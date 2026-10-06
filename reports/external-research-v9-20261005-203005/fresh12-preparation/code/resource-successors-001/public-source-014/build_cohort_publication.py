#!/usr/bin/env python3
"""Freeze exact positive metadata/neutral task publication cohort, no bodies."""
from pathlib import Path
import json
import shutil
import prepare_successors as p
import build_publication as publication

ROOT=Path(__file__).resolve().parent
def prepare():
    # Explicit current editions; preliminary confirmations001 stay historical.
    allowed={'fresh-cohort001','fresh-cohort002','confirmation-full-closure002','bundle-i08-001'}
    root_names={'FRESH12_SOURCE_OWNER_INVENTORY_001.json','COMMON_SOURCE_SEPARATION_OVERLAY_002.md',
                'I08_TERMINAL_ROLE_SELECTION_001.json','LEGACY_FIELD_CLARIFICATION_001.json'}
    selected=[]
    for path in publication.files():
        relative=path.relative_to(ROOT)
        if relative.parts[0] in allowed or (len(relative.parts)==1 and path.name in root_names):
            if {'native','out','prior','seed','source_context','evaluation','operator-profile','native_role_proofs'}.intersection(relative.parts):
                raise ValueError('Forbidden candidate/native/private namespace')
            selected.append(p.ref(path))
    # Durable source snapshot, so further authorized owner engineering does not
    # mutate a published source PIN. No other owner's code/files are rewritten.
    code_root=ROOT/'public-source-014';code_refs=[]
    for name in ['prepare_fresh_cohort.py','bind_fresh_runtime.py','prepare_confirmation_closure.py',
                 'prepare_bundle_transport.py','prepare_i08_bundle.py','hydrate_role_proofs.py',
                 'prepare_successors.py','test_fresh_cohort.py','test_confirmation_closure.py','test_role_bundle.py',
                 'build_publication.py','build_cohort_publication.py']:
        source=ROOT/name;target=code_root/name;target.parent.mkdir(parents=True,exist_ok=True)
        if target.exists():raise ValueError('Public code edition already frozen')
        shutil.copyfile(source,target);code_refs.append(p.ref(target))
    p.put(code_root/'PIN.json',{'schema':'er9.resource-packet-source-edition.v1','files':code_refs,
                              'source_semantics_evaluator_or_native_IO_included':False,'native_starts':0})
    selected.extend(code_refs);selected.append(p.ref(code_root/'PIN.json'))
    p.put(ROOT/'PUBLICATION_SELECTION_014.json',{'schema':'er9.positive-publication-selection.v1',
             'scope_root':str(ROOT),'files':selected,'candidate_role_or_captured_source_bodies_selected':False,
             'native_raw_output_auth_private_evaluator_selected':False,
             'publisher_only_adds_listed_exact_sha_files':True,
             'published_source_is_immutable_snapshot':True,'native_starts':0,'quality_or_pipeline_completion_claimed':False})
    print(json.dumps({'selector':p.ref(ROOT/'PUBLICATION_SELECTION_014.json'),'files':len(selected)}))

if __name__=='__main__':prepare()
