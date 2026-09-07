#!/usr/bin/env python3
"""Build Assistant demo coverage indexes without converting scene launches into proof.

The full supplied source wording is preserved in the companion source freeze.
This repo-resident index keeps every retained identity and its owner/source reference;
it does not substitute an old audit verdict for an executed demo outcome.
"""
from __future__ import annotations
import csv, hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Plans/.audits/assistant-settings-v3'
C=ROOT/'Concepts/chat-assistant-concepts/5.6 Pro'
BASE='c99872170dab69b46d82f0d0f0abb1e8d408fc1f'
EXPECTED_HTML='31b4d0d29516f5ae96a3b084bee9b8e1c3fdca0b8c8df707edad4dab180cebcc'
PREFIX={
 'AUTH':'authority','COMPOSER':'composer','ATT':'attachments','TITLE':'title-spellcheck',
 'GOAL':'goal','PLAN':'regular-plan','DPLAN':'deep-plan','TODO':'todos','COLLAB':'collaboration',
 'CREW':'crew','BRAIN':'brainstorm','REVIEW':'review','ROOM':'chat_room','WONDER':'wonderer',
 'BSD':'bsd','BROWSER':'browser','SCHED':'scheduling','PROVIDER':'provider-control',
 'GUI':'assistant-layout','DRY':'commands-governance','QMAX':'question-budget',
 'PPROG':'plan-progress','PFAIL':'plan-recovery','PDET':'plan-records','PGOAL':'build-as-goal',
 'PSCHED':'plan-scheduling','GREPLAY':'goal-replay','MODAL':'modal-transaction',
 'PART':'participant-outcomes','SMSG':'scheduled-message','BSTALE':'browser-currentness',
 'FOLDER':'folders','TDG':'todo-graph','WONV':'wonderer-convergence',
 'CONCEPT':'concept-integration','CDRY':'contract-proof'}
APR={1:'activity-panels',2:'assistant-layout',3:'assistant-layout',4:'activity-bar',5:'activity-hover',6:'activity-hover',7:'activity-hover',8:'todos',9:'context-details',10:'composer',11:'transcript-records',12:'working-activity',13:'wand',14:'demo-gallery',15:'audit-process',16:'demo-gallery',17:'working-activity',18:'motion-evidence',19:'scheduling',20:'reset-lifecycle',21:'collaboration',22:'authority',23:'commands-governance',24:'commands-governance',25:'commands-governance',26:'delivery',27:'scheduling',28:'bsd',29:'collaboration-pickers',30:'context-lens',31:'activity-bar',32:'assistant-layout',33:'goal',34:'assistant-layout',35:'title-spellcheck',36:'plan-tabs',37:'plan-tabs',38:'assistant-layout',39:'transcript-records',40:'transcript-records',41:'transcript-records',42:'activity-panels',43:'scheduled-message',44:'settings-persistence',45:'settings-build',46:'working-activity',47:'settings-managers',48:'settings-managers',49:'authority',50:'reset-lifecycle',51:'collaboration-pickers',52:'collaboration-options',53:'collaboration-options',54:'review',55:'transcript-records',56:'internal-notes',57:'history',58:'history',59:'goal-todos',60:'activity-panels',61:'context-details',62:'settings-managers',63:'settings-build',64:'reference-evidence',65:'settings-managers',66:'assistant-layout',67:'review',68:'working-activity',69:'authority',70:'delivery'}
FEATURE={1:'teach',2:'teacher',3:'assistant-memory',4:'assistant-memory',5:'eli5',6:'eli5',7:'debug',8:'debug',9:'revert',10:'context-lens'}
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def group(source,rid):
    pre,n=rid.rsplit('-',1);n=int(n)
    if source=='v3':return APR[n]
    if pre=='FEATURE':return FEATURE[n]
    if pre=='TITLE' and n>6:return 'spellcheck'
    if pre=='CREW' and n>=4:return 'crew-auto'
    return PREFIX[pre]
def main():
    html=C/'PM_Chat_Assistant_5.6_Pro_Standalone.html'
    if digest(html)!=EXPECTED_HTML:raise SystemExit('Source freeze changed; recensus and review before rebinding evidence.')
    table=OUT/'DEMO_COVERAGE_MATRIX.md';features={}
    for line in table.read_text(encoding='utf-8').splitlines():
        if not line.startswith('| '):continue
        cells=[x.strip() for x in line.split('|')[1:-1]]
        if len(cells)!=6 or not cells[1].isdigit():continue
        features[cells[0]]={'expected_source_rows':int(cells[1]),'required_scenario_a':cells[2],'required_scenario_b':cells[3],'candidate_gallery_ids':cells[4],'new_concept_subchecks':int(cells[5])}
    assert len(features)==67
    original=C/'reports/REDESIGN_TRACEABILITY.json';correction=C/'reports/CORRECTION_V4_TRACEABILITY.json';apr=OUT/'REQUIREMENT_CLOSURE.csv'
    sources={'v2':read(original)['rows'],'v4':read(correction)['requirements'],'v3':list(csv.DictReader(apr.open(encoding='utf-8',newline='')))}
    assert {s:len(r) for s,r in sources.items()}=={'v2':236,'v4':245,'v3':70}
    rows=[]
    for source,items in sources.items():
        for item in items:
            rid=item['requirement_id'];fid=group(source,rid);f=features[fid]
            src=str({'v2':original,'v4':correction,'v3':apr}[source].relative_to(ROOT))+'#'+rid
            packet={'v2':'PM_Assistant_v2_Additive_Correction_v4/reference/V2_REQUIREMENTS_SNAPSHOT.json','v4':'PM_Assistant_v2_Additive_Correction_v4/machine/correction_requirements.json','v3':'PM_Assistant_Plans_Repair_Packet_v3/REQUIREMENTS.csv'}[source]
            row={'coverage_id':source+':'+rid,'requirement_id':rid,'source_family':source,'feature_group':fid,'repo_inventory_reference':src,'original_packet_reference':packet+'#'+rid,'source_wording':item.get('statement'),'wording_custody':'mirrored_exact_v2_statement' if source=='v2' else 'full_wording_in_companion_source_freeze_not_replaced_by_audit_summary','source_freeze_sha256':'467d9411e1a248ab0f3ebdd6cc3c6b5227091833e7b892b7ab79b9f7f5ed02d4','owner_reference':item.get('owner_hint',item.get('owner_path',item.get('owner_docs'))),'required_scenario_a':f['required_scenario_a'],'required_scenario_b':f['required_scenario_b'],'candidate_gallery_ids':f['candidate_gallery_ids'],'two_meaningful_demos_verified':False,'coverage_status':'FULL_CLAUSE_OUTCOME_PROOF_OPEN','native_proof':False,'motion_proof':False}
            if source=='v3' and rid in ['APR-018','APR-064']:row['coverage_status']='SEPARATE_MEDIA_OBLIGATION_NOT_EXECUTED'
            if source=='v3' and rid=='APR-039':row['supersession']='Public Work note treatment narrowed by APR-056/069; diagnostic access only.'
            rows.append(row)
    ids=[r['coverage_id'] for r in rows];assert len(ids)==len(set(ids))==551
    for fid,f in features.items():assert sum(r['feature_group']==fid for r in rows)==f['expected_source_rows'],fid
    result={'schema_id':'pm.assistant_demo_coverage_matrix.v1','source_commit':BASE,'html_sha256':EXPECTED_HTML,'source_inventory_hashes':{str(p.relative_to(ROOT)):digest(p) for p in [original,correction,apr]},'source_counts':{s:len(r) for s,r in sources.items()},'source_rows':551,'feature_groups':67,'matrix_identity_completeness':'pass','APR_016':'open','APR_018':'not_executed','evidence_boundary':'Candidate scenes and API subchecks do not constitute two complete user-visible outcomes. Full original wording remains in the separately hash-bound source freeze. No semantic acceptance is inferred from source identity completeness.','feature_definitions':features,'requirements':rows}
    jp=OUT/'DEMO_REQUIREMENT_MATRIX.json';jp.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    fields=['coverage_id','feature_group','repo_inventory_reference','original_packet_reference','source_wording','wording_custody','required_scenario_a','required_scenario_b','candidate_gallery_ids','coverage_status','two_meaningful_demos_verified','native_proof','motion_proof']
    cp=OUT/'DEMO_REQUIREMENT_MATRIX.csv'
    with cp.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',lineterminator='\n');w.writeheader();w.writerows(rows)
    receipt={'matrix_identity_completeness':'pass','requirements':551,'features':67,'unique_requirement_ids':551,'source_counts':result['source_counts'],'json_sha256':digest(jp),'csv_sha256':digest(cp),'full_demo_acceptance':'open','native_runtime_enabled':False,'generated_from':str(table.relative_to(ROOT))}
    (OUT/'DEMO_MATRIX_VALIDATION.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(receipt,indent=2))
if __name__=='__main__':main()
